import os
import pandas as pd
from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Count, Max
from django.forms import model_to_dict
from pathlib import Path

from listener.models import Progresses, Challenges, PcPlagiarismCheck, PcCodeComparison, Teams, TeamMembers, \
     PcEngine, Users, PcDecision

from listener.utils import clone_repos, concatenate_c_files, user_model_to_dict, team_member_user_model_to_dict

######################################
# Settings page | available_engines(request) | users(request)
######################################

def get_all_engines():
    queryset = PcEngine.objects.all()
    engines = [{
        'id': record.id,
        'name': record.name,
        'version': record.version
    } for record in queryset]

    return engines


def get_non_student_users():
    queryset = Users.objects.exclude(global_role=4)
    non_student_users = [
        {
            'id': record.id,
            'firstName': record.first_name,
            'lastName': record.last_name
        }
        for record in queryset
    ]
    return non_student_users


######################################
# Challenge overview page | challenges(request)
######################################


def get_reviewable_challenges_by_user_id(user_id: str):
    challenge_objects = get_reviewable_challenges_objects_with_branch_by_user_id(user_id)

    challenge_ids = [record.id for record in challenge_objects]
    plagiarism_status_dict = get_challenge_id_plagiarism_check_status_dict_by_challenge_ids(challenge_ids)

    reviewable_challenges = [{
        'id': record.id,
        'name': record.name,
        'startDate': record.start_at,
        'endDate': record.end_at,
        'branchName': record.branch.name,
        'plagiarismCheckStatus': plagiarism_status_dict[record.id] if plagiarism_status_dict.get(record.id) else None
    } for record in challenge_objects]

    return reviewable_challenges

def get_reviewable_challenges_objects_with_branch_by_user_id(user_id: str):
    if user_id == '0':  # '0' is admin, returns all challenges
        challenge_objects = Challenges.objects.select_related(
            'branch'
        ).distinct()
    else:
        challenge_objects = Challenges.objects.select_related(
            'branch'
        ).filter(
            challengeresponsible__user_id=user_id
        ).distinct()
    return challenge_objects


def get_challenge_id_plagiarism_check_status_dict_by_challenge_ids(challenge_ids: list[str]):
    plagiarism_check_objects = PcPlagiarismCheck.objects.filter(challengeid__in=challenge_ids)
    challenge_id_plagiarism_check_status_dict = {
        record.challengeid.id: record.status
        for record in plagiarism_check_objects
    }
    return challenge_id_plagiarism_check_status_dict


######################################
# Code comparison  (old) | code_comparisons(request)
######################################
def get_code_comparisons_by_challenge_id(challenge_id):
    queryset = PcCodeComparison.objects.filter(
        plagiarismcheckid__challengeid__id=challenge_id
    ).select_related(
        'plagiarismcheckid',  # linked to PcPlagiarismCheck
        # 'plagiarismcheckid__engineid',  # linked to PcEngine
    )

    involved_team_ids = set()
    for record in queryset:
        involved_team_ids.add(record.teama)
        involved_team_ids.add(record.teamb)
    team_users_dict = get_team_users_dict_by_team_ids(involved_team_ids)

    team_submission_time_dict = get_team_latest_submission_time_dict(challenge_id)

    # todo: get supervisor id from request, now set as 0, so decisions set by other users are invisible
    team_decision_dict = get_decisions_by_challenge_id(challenge_id)

    comparisons = [{
        'id': record.id,
        'teamA': {
            'id': record.teama.id,
            'leader': record.teama.leader.nickname,
            'students': team_users_dict[record.teama.id],
            'codebase': 'to do',
            'submissionTime': team_submission_time_dict[record.teama.id],
            'decision': team_decision_dict.get(record.teama.id)
        },
        'teamB': {
            'id': record.teamb.id,
            'students': team_users_dict[record.teamb.id],
            'leader': record.teamb.leader.nickname,
            'codebase': 'to do',
            'submissionTime': team_submission_time_dict[record.teamb.id],
            'decision': team_decision_dict.get(record.teamb.id)
        },
        'similarity': record.similarity
    } for record in queryset]

    return comparisons

# decision(request, challenge_id, team_id)
def get_team_users_dict_by_team_ids(team_ids):
    queryset = TeamMembers.objects.select_related('user').filter(team_id__in=team_ids)
    team_users_dict = {}
    for record in queryset:
        if record.team_id not in team_users_dict:
            team_users_dict[record.team_id] = []
        team_users_dict[record.team_id].append(team_member_user_model_to_dict(record))

    return team_users_dict


def get_decisions_by_challenge_id(challenge_id: int):
    query = PcDecision.objects.filter(
        plagiarism_check__challengeid=challenge_id
    ).values('team_id', 'decision')

    team_decision_dict = {record['team_id']: record['decision'] for record in query}
    return team_decision_dict

def get_team_latest_submission_time_dict(challenge_id):
    # query the latest submission time of each team given a challenge id
    queryset = Progresses.objects.filter(
        challenge_id=challenge_id
    ).values('team_id').annotate(
        latestSubmissionTime=Max('updatedat')
    ).order_by('team_id')

    team_submission_time_dict = {item['team_id']: item['latestSubmissionTime'] for item in queryset}

    return team_submission_time_dict


######################################
# Plagiarism check page (new) | plagiarism_check_new(request)
######################################

def get_plagiarism_check_by_challenge_id_new(challenge_id):
    queryset = PcCodeComparison.objects.filter(
        plagiarismcheckid__challengeid__id=challenge_id
    ).select_related(
        'plagiarismcheckid'  # linked to PcPlagiarismCheck
    )

    plagiarism_check_id = None
    if queryset.exists():
        first_record = queryset.first()
        plagiarism_check_id = first_record.plagiarismcheckid_id
    else:
        return {
            'challengeId': challenge_id,
            'id': plagiarism_check_id,
            'codeComparisons': [],
            'teams': []
        }

    involved_team_objects = set()
    for record in queryset:
        involved_team_objects.add(record.teama)
        involved_team_objects.add(record.teamb)
    team_users_dict = get_team_users_dict_by_team_ids(involved_team_objects)
    team_leader_nickname_dict = extract_team_leader_nickname_from_team_users_dict(team_users_dict)

    team_submission_time_dict = get_team_latest_submission_time_dict(challenge_id)
    team_decision_dict = get_decisions_by_challenge_id(challenge_id)

    team_max_similarity_dict = {}
    code_comparisons = []
    for record in queryset:
        if record.similarity is None:
            continue
        if record.teama.id in team_max_similarity_dict:
            team_max_similarity_dict[record.teama.id] = max(team_max_similarity_dict[record.teama.id], record.similarity)
        else:
            team_max_similarity_dict[record.teama.id] = record.similarity
        if record.teamb.id in team_max_similarity_dict:
            team_max_similarity_dict[record.teamb.id] = max(team_max_similarity_dict[record.teamb.id], record.similarity)
        else:
            team_max_similarity_dict[record.teamb.id] = record.similarity

        code_comparisons.append({
            'id': record.id,
            'teamA': {
                'id': record.teama.id
            },
            'teamB': {
                'id': record.teamb.id
            },
            'similarity': record.similarity
        })

    # remove unneeded fields from student models
    for team in involved_team_objects:
        users = team_users_dict[team.id]
        for user in users:
            # user.pop("nickname", None)
            user.pop("isLeader", None)

    teams = [{
        'id': team.id,
        'leaderNickname': team_leader_nickname_dict[team.id],
        'submissionTime': team_submission_time_dict[team.id],
        'maxSimilarity': team_max_similarity_dict.get(team.id),
        'decision': team_decision_dict.get(team.id),
        'students': team_users_dict[team.id]
    } for team in involved_team_objects]

    return {
        'challengeId': challenge_id,
        'id': plagiarism_check_id,
        'codeComparisons': code_comparisons,
        'teams': teams
    }


def extract_team_leader_nickname_from_team_users_dict(team_users_dict):
    team_leader_dict = {}
    for team_id, users in team_users_dict.items():
        for user in users:
            if user['isLeader']:
                team_leader_dict[team_id] = user['nickname']
                break
    return team_leader_dict


######################################
# Get code of teams | get_code(request)
######################################

def get_code_by_team_id(challenge_id, team_id):
    progress = Progresses.objects.filter(
        challenge_id=challenge_id,
        team_id=team_id
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
    )[0]

    if progress is None:
        return None

    if len(challenge_id) == 1:
        challenge_id = f'0{challenge_id}'

    team_name =  f"{progress['team__leader__nickname']}-{progress['team_count']}"
    file_name = f"{team_name}/src/challenge_{challenge_id}_{team_name}.c"

    if not os.path.exists(os.getcwd() + f"/challenge_{challenge_id}/" +file_name):
        root_dir = os.getcwd()
        repo = f"git@git.rwth-aachen.de:22022/{challenge_id}/{team_name}"
        clone_repos(challenge_id, [repo], False)
        concatenate_c_files(challenge_id, team_name)
        os.chdir(root_dir)
    
    content = Path(f'challenge_{challenge_id}/' + file_name).read_text()
    return content

######################################
# Decision making | decision(request, challenge_id, team_id)
######################################

def update_or_insert_decision(plagiarism_check_id: int, team_id: int, decision: str, supervisor_id: int) -> bool:
    try:
        decision_record = PcDecision.objects.get(
            plagiarism_check__id=plagiarism_check_id,
            team__id=team_id
        )
        decision_record.decision = decision
        decision_record.supervisor_id = supervisor_id
        decision_record.save()
        return True
    except PcDecision.DoesNotExist:
        try:
            PcDecision.objects.create(
                plagiarism_check_id=plagiarism_check_id,
                team_id=team_id,
                decision=decision,
                supervisor_id=supervisor_id
            )
            return True
        except Exception as e:
            print(f"update_or_insert_decision error: Error creating PcDecision, {e}")
            return False
    except Exception as e:
        print(f"update_or_insert_decision error: {e}")
        return False


######################################
# Batch 'NO plagiarism' decision-making | decision(request, challenge_id)
######################################
def mark_undecided_cases_as_no_plagiarism_by_challenge_id(challenge_id, supervisor_id: int):

    # query all teams that have submitted
    involved_teams = Progresses.objects.filter(
        challenge_id=challenge_id
    ).values_list('team_id', flat=True).distinct()
    involved_team_id_set = set(involved_teams)
    print(f"{len(involved_team_id_set)} involved teams")

    plagiarism_check = PcPlagiarismCheck.objects.filter(challengeid__id=challenge_id).first()
    if plagiarism_check:
        plagiarism_check_id = plagiarism_check.id
    else:
        return None

    # query team ids that already have decision records, including those with a NULL decision
    team_ids_with_decision = PcDecision.objects.filter(
        plagiarism_check_id=plagiarism_check_id
    ).values_list('team_id', flat=True)
    team_id_set_with_decision = set(team_ids_with_decision)
    print(f"{len(team_id_set_with_decision)} teams have decision records (including NULL decisions)")

    team_ids_without_decision = list(involved_team_id_set - team_id_set_with_decision)

    # set all NULL decision to Innocent
    updated_null_decision_count = PcDecision.objects.filter(
        plagiarism_check_id=plagiarism_check_id,
        decision__isnull=True
    ).update(
        decision='Innocent',
        supervisor_id=supervisor_id
    )
    print(f"Set {updated_null_decision_count} NULL decisions to Innocent")

    # set all undecided teams to Innocent
    decisions_to_create = [
        PcDecision(
            team_id=team_id,
            plagiarism_check_id=plagiarism_check_id,
            supervisor_id=supervisor_id,
            decision='Innocent'
        )
        for team_id in team_ids_without_decision
    ]
    PcDecision.objects.bulk_create(decisions_to_create)
    print(f"Created {len(decisions_to_create)} Innocent decisions")

    affected_rows = len(decisions_to_create) + updated_null_decision_count
    return affected_rows


######################################
# Not Used right now
######################################

# Return two teams code by finding the code from the csv data by team id
def get_teams_code_by_id(challenge_id, teamA_id, teamB_id):
    report_file = f"./challenge_{challenge_id}/files.csv"
    data = pd.read_csv(report_file)
    leadA_nickname = Teams.objects.get(id=teamA_id).leader.nickname
    leadB_nickname = Teams.objects.get(id=teamB_id).leader.nickname
    #everything in path after first / and before - is the team leader nickname
    teamA_code = data[data['path'].str.contains(leadA_nickname)].content.values[0]
    teamB_code = data[data['path'].str.contains(leadB_nickname)].content.values[0]
    codedict = {
        'codebaseA': teamA_code,
        'codebaseB': teamB_code
    }
    return codedict