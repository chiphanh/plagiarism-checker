import json

from django.http import HttpResponse, JsonResponse

from listener.services import get_code_comparisons_by_challenge_id, \
    get_reviewable_challenges_by_user_id, \
    get_all_engines, get_non_student_users, \
    update_or_insert_decision, get_decisions_by_challenge_id, \
    get_code_by_team_id, get_plagiarism_check_by_challenge_id_new, mark_undecided_cases_as_no_plagiarism_by_challenge_id

from listener.utils import is_integer, ErrorCode, error_response

from listener.models import PcPlagiarismCheck, Progresses, PcDecision
from listener.check_run import initiate_check, get_repos_by_challenge_id


######################################
# Settings page
######################################
def available_engines(request):
    result = get_all_engines()
    return JsonResponse(result, safe=False)

def users(request):
    users = get_non_student_users()
    return JsonResponse(users, safe=False)

######################################
# Challenge overview page
######################################
def challenges(request):
    user_id = request.GET.get('userId', None)
    if user_id is None:
        return error_response(request, ErrorCode.BAD_REQUEST.code, 'userId is required.')
    elif is_integer(user_id) is False:
        return error_response(request, ErrorCode.BAD_REQUEST.code, 'userId must be integer.')

    result = get_reviewable_challenges_by_user_id(user_id)
    return JsonResponse(result, safe=False)

######################################
# Code comparison / Plagiarism check page
######################################
def code_comparisons(request):
    challenge_id = request.GET.get('challengeId', None)
    if challenge_id is None:
        return error_response(request, ErrorCode.BAD_REQUEST.code, 'challengeId is required.')
    elif is_integer(challenge_id) is False:
        return error_response(request, ErrorCode.BAD_REQUEST.code, 'challengeId must be integer.')

    result = get_code_comparisons_by_challenge_id(challenge_id)
    return JsonResponse(result, safe=False)


def plagiarism_check_new(request):
    challenge_id = request.GET.get('challengeId', None)
    if challenge_id is None:
        return error_response(request, ErrorCode.BAD_REQUEST.code, 'challengeId is required.')
    elif is_integer(challenge_id) is False:
        return error_response(request, ErrorCode.BAD_REQUEST.code, 'challengeId must be integer.')

    result = get_plagiarism_check_by_challenge_id_new(challenge_id)
    return JsonResponse(result, safe=False)


def get_code(request):
    team_id = request.GET.get('teamId', None)
    if team_id is None:
        return error_response(request, ErrorCode.BAD_REQUEST.code, 'team_id is required.')
    challenge_id = request.GET.get('challengeId', None)
    if challenge_id is None:
        return error_response(request, ErrorCode.BAD_REQUEST.code, 'challenge_id is required.')

    content = get_code_by_team_id(challenge_id, team_id)

    return HttpResponse(content, content_type='text/plain')
    
######################################
# Decision making
######################################
def decision_by_challenge_and_team_id(request, challenge_id, team_id):
    if request.method != 'PATCH':
        return error_response(request, ErrorCode.BAD_REQUEST.code, 'Method not implemented.')

    request_body = json.loads(request.body)
    if request_body.get('supervisorId') is None:
        return error_response(request, ErrorCode.BAD_REQUEST.code,
                              'The parameter "supervisorId" is not given in the request body.')
    decision_value = request_body.get('decision')
    if decision_value is not None and decision_value != 'Guilty' and decision_value != 'Innocent':
        return error_response(request, ErrorCode.BAD_REQUEST.code,
                              'The parameter "decision" should be "Guilty" or "Innocent" or null')

    plagiarism_check_id = PcPlagiarismCheck.objects.get(
            challengeid=challenge_id
    ).id
    
    update_result = update_or_insert_decision(plagiarism_check_id, team_id, decision_value, request_body.get('supervisorId'))
    if update_result:
        return JsonResponse("Update succeeded.", safe=False)
    else:
        return error_response(request, ErrorCode.INTERNAL_SERVER_ERROR.code, 'Update failed.')


######################################
# Batch mark undecided cases as 'No plagiarism'
######################################
def mark_undecided_cases_as_no_plagiarism(request, challenge_id):
    if request.method != 'PATCH':
        return error_response(request, ErrorCode.BAD_REQUEST.code, 'Method not implemented.')

    request_body = json.loads(request.body)
    if request_body.get('supervisorId') is None:
        return error_response(request, ErrorCode.BAD_REQUEST.code,
                              'The parameter "supervisorId" is not given in the request body.')
    supervisor_id = request_body.get('supervisorId')

    try:
        affected_rows = mark_undecided_cases_as_no_plagiarism_by_challenge_id(challenge_id, supervisor_id)
    except Exception:
        return error_response(request, ErrorCode.INTERNAL_SERVER_ERROR.code, "Internal Server Error")

    if affected_rows is None:
        return error_response(request, ErrorCode.BAD_REQUEST.code, "NO existing plagiarism check")

    return JsonResponse("Update succeeded.", safe=False)


# view for  get_teams_code_by_id(teamA_id, teamB_id
def get_decisions(request, challenge_id, team_id):
    challenge_id = request.GET.get('challengeId', None)
    if challenge_id is None:
        return error_response(request, ErrorCode.BAD_REQUEST.code, 'challenge_id is required.')

    result = get_decisions_by_challenge_id(challenge_id)

    return JsonResponse(result, safe=False)
    


