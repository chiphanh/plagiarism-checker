import json
import os
from django.db.models import Count, Max
import subprocess
import threading
from django.forms import model_to_dict
from django.http import JsonResponse
from listener.models import PcPlagiarismCheck, Users, PcEngine, PcCodeComparison, Challenges, Progresses, Teams
from listener.utils import ErrorCode, error_response, clone_repos, concatenate_c_files, get_files_in_folder, backend_folder_cleanup

######################################
# All parts for cloning code and running a check on a single challenge
######################################

######################################
# Run a new check
######################################
def initiate_check(request):
    data = json.loads(request.body)
    
    challenge_id = data.get('challengeId', None)
    engine_id = data.get('engineId', None)
    supervisor_id = data.get('userId', None)

    if challenge_id is None:
        return error_response(request, ErrorCode.BAD_REQUEST.code, 'challengeId is required.')
    if engine_id is None:
        return error_response(request, ErrorCode.BAD_REQUEST.code, 'engineId is required.')
    if supervisor_id is None:
        return error_response(request, ErrorCode.BAD_REQUEST.code, 'userId is required.')
    
    if (data.get('rerun')):
        plagiarism_check = reset_pc_check(challenge_id, engine_id, supervisor_id)
    else:
        plagiarism_check = create_pc_check(challenge_id, engine_id, supervisor_id)

    t = threading.Thread(target=start_check, args=([challenge_id]))
    t.start()

    return JsonResponse(plagiarism_check)



def start_check(challenge_id):
    root_dir = os.getcwd()

    challenge_id = str(challenge_id)
    if len(challenge_id) == 1:
        challenge_id = f'0{challenge_id}'

    repos, team_names = get_repos_by_challenge_id(challenge_id)

    clone_repos(challenge_id, repos)

    for team in team_names:
        concatenate_c_files(challenge_id, team)
    os.chdir(root_dir)

    run_dolos(f"challenge_{challenge_id}", challenge_id)
    

def run_dolos(folder, chal_id):
    files = get_files_in_folder(folder)
    subprocess.run(["dolos"] + ['-f'] + ['csv'] + files)
    add_results_to_db(chal_id)

######################################
# DB operations
######################################
def add_results_to_db(chal_id):
    report_folders = [folder for folder in os.listdir('.') if folder.startswith('dolos-report-')]
    report_folders.sort(reverse=True)
    filepath = os.path.join('.', report_folders[0])
    with open(filepath+"/pairs.csv", "r") as f:
        rows = [row.strip().split(',') for row in f.readlines()]
        for row in rows[1:]:
            teama_leader = Users.objects.get(nickname=row[2][row[2].find('/')+1:row[2].find('/', row[2].find('/')+1)][:-2])
            teamb_leader = Users.objects.get(nickname=row[4][row[4].find('/')+1:row[4].find('/', row[4].find('/')+1)][:-2])
            #print('a: ', teama_leader.id, 'b: ', teamb_leader.id, 'sim: ', row[5])
            make_code_comparison(int(chal_id), teama_leader, teamb_leader, row[5])

    backend_folder_cleanup(filepath, chal_id)

    update_pc_check_status(int(chal_id), 'Finished')


def update_pc_check_status(chal_id, status):
    check = PcPlagiarismCheck.objects.get(challengeid=chal_id)
    check.status = status
    check.save()

def reset_pc_check(challenge_id, engine_id, user_id):
    plagiarism_check = PcPlagiarismCheck.objects.get(
        challengeid=Challenges.objects.get(id=challenge_id),
    )
    plagiarism_check.status = 'Running'
    plagiarism_check.engineid = PcEngine.objects.get(id=engine_id)
    plagiarism_check.supervisorid = Users.objects.get(id=user_id)
    plagiarism_check.save()
    PcCodeComparison.objects.filter(plagiarismcheckid=plagiarism_check).delete()
    return model_to_dict(plagiarism_check)

def create_pc_check(challenge_id, engine_id, user_id):
    plagiarism_check = PcPlagiarismCheck(
        challengeid = Challenges.objects.get(id=challenge_id),
        engineid = PcEngine.objects.get(id=engine_id),
        status='Running',
        supervisorid=Users.objects.get(id=user_id)
    )
    plagiarism_check.save()
    return model_to_dict(plagiarism_check)


def make_code_comparison(chal_id: str, teama_leader_id: str, teamb_leader_id: str, similarity: float):
    comp = PcCodeComparison(
            plagiarismcheckid=PcPlagiarismCheck.objects.get(challengeid=chal_id),
            teama=Teams.objects.get(leader=teama_leader_id),
            teamb=Teams.objects.get(leader=teamb_leader_id),
            similarity=similarity,
            
        )
    try:
        comp.save()
    except Exception:
        return False
    return True


def get_repos_by_challenge_id(challenge_id):
    queryset = Progresses.objects.filter(
        challenge_id=challenge_id
    ).select_related(
        'team__leader'
    ).values(
        'team_id',
        'team__leader__nickname'
    ).annotate(
        latestSubmissionTime=Max('updatedat'),
        team_count=Count('id')
    ).order_by(
        'team__leader__nickname'
    )

    team_names = [
        (f"{entry['team__leader__nickname']}"
         f"-{entry['team_count']}")
        for entry in queryset]
    repos = []
    # print the results
    for item in team_names:
        repos.append(f'git@git.rwth-aachen.de:22022/{challenge_id}/{item}')

    return repos, team_names

