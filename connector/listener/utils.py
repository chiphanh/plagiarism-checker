from enum import Enum
import os
import shutil
import subprocess
from django.http import JsonResponse
import pandas as pd


######################################
# Utility functions
######################################
def is_integer(s: str):
    try:
        int(s)  # try casting s to an integer
        return True
    except ValueError:
        return False


def user_model_to_dict(user_object):
    return {
        'user_id': user_object.id,
        'nickname': user_object.nickname,
        'first_name': user_object.first_name,
        'last_name': user_object.last_name
    }

def team_member_user_model_to_dict(team_member_user_object):
    return {
        'id': team_member_user_object.user.id,
        'firstName': team_member_user_object.user.first_name,
        'lastName': team_member_user_object.user.last_name,
        'nickname': team_member_user_object.user.nickname,
        'isLeader': True if team_member_user_object.team.leader_id == team_member_user_object.user.id else False
    }

######################################
# Errors
######################################

class ErrorCode(Enum):
    BAD_REQUEST = (400, "Bad Request")
    NOT_FOUND = (404, "Not Found")
    INTERNAL_SERVER_ERROR = (500, "Internal Server Error")

    def __init__(self, code, description=None):
        self.code = code
        self.description = description

def error_response(request, error_code, error_message):
    print(request.build_absolute_uri())
    data = {
        'status': error_code,
        'message': error_message,
        'uri': request.method + ' ' + request.build_absolute_uri()
    }
    return JsonResponse(data, safe=False)


######################################
# File management
######################################

def clone_repos(challenge_id, repos, delete_old=True):

    folder_name = f"challenge_{challenge_id}"
    if os.path.exists(folder_name) and delete_old:
        shutil.rmtree(folder_name)
    os.makedirs(folder_name, exist_ok=True)
    os.chdir(folder_name)

    for repo_url in repos:
        subprocess.run(["git", "clone", repo_url])

def concatenate_c_files(challenge_id, team_name):
    starting_dir = os.getcwd()
    os.chdir(team_name + "/src")
    c_files = [file for file in os.listdir() if file.endswith(".c")]

    combined_file_name = f"challenge_{challenge_id}_{team_name}.c"
    with open(combined_file_name, "w") as combined_file:
        for c_file in c_files:
            with open(c_file, "r") as individual_c_file:
                combined_file.write(individual_c_file.read() + "\n")

    os.chdir(starting_dir)



def get_files_in_folder(folder_path):
    files = []
    subfolders = [folder_path + "/" + subfolder + "/src" for subfolder in os.listdir(folder_path) if os.path.isdir(folder_path + "/" + subfolder)]
    for subfolder_path in subfolders:
        files.extend([subfolder_path + "/" + file for file in os.listdir(subfolder_path) if file.startswith("challenge_")])
    return files


def backend_folder_cleanup(filepath, chal_id):
    shutil.rmtree(filepath+f"/../challenge_{chal_id}", ignore_errors=True) 
    os.makedirs(filepath+f"/../challenge_{chal_id}", exist_ok=False)

    df = pd.read_csv(filepath+"/files.csv")
    df = df.iloc[:, [0, 2, 3]]
    df.to_csv(filepath+"/files.csv", index=False)

    shutil.move(filepath+"/files.csv", filepath+f"/../challenge_{chal_id}/files.csv")

    report_folders = [folder for folder in os.listdir('.') if folder.startswith('dolos-report-')]
    for folder in report_folders:
        shutil.rmtree(folder)

