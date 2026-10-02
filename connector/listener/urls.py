from django.urls import path
from django.views.decorators.csrf import csrf_exempt

from . import views

urlpatterns = [
    ######################################
    # Settings page
    ######################################
    path("available-engines", views.available_engines),
    path("users", views.users),
    
    
    path("initiate-check", csrf_exempt(views.initiate_check)),

    ######################################
    # Challenge overview page
    ######################################
    path("challenges", views.challenges),

    ######################################
    # Code comparison / Plagiarism check page
    ######################################
    path("code-comparisons", views.code_comparisons), # to be removed
    path("plagiarism-check", views.plagiarism_check_new),
    path("code", views.get_code),

    
    ######################################
    # Decision making
    ######################################
    path("decision/<int:challenge_id>/<int:team_id>", csrf_exempt(views.decision_by_challenge_and_team_id)),
    path("decision/<int:challenge_id>", csrf_exempt(views.mark_undecided_cases_as_no_plagiarism)),
    path("decisions", csrf_exempt(views.get_decisions)),


]
