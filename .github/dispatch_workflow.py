#!/usr/bin/python3
import os
import sys
import time

import jwt
import requests

# 10 mins. Timeout to wait for triggered job to be created (not finished)
JOB_WAIT_TIMEOUT = 10 * 60
# 1 hour. Timeout to wait fo job to finish
JOB_TIMEOUT = 60 * 60

GITHUB_API_BASE = "https://api.github.com"
GITHUB_UI_BASE = "https://github.com"


def make_jwt_token(private_key):
    jwt_payload = {
        "iat": int(time.time()),
        "exp": int(time.time() + 600),
        "iss": os.environ["APP_ID"],
    }
    print("Getting app JWT...")
    jwt_token = jwt.encode(jwt_payload, private_key, algorithm="RS256").decode()
    print("Got app JWT!")
    return jwt_token


def get_installation_id(jwt_token):
    return requests.get(
        f"{GITHUB_API_BASE}/app/installations",
        headers={"Authorization": f"Bearer {jwt_token}"},
    ).json()[0]["id"]


def job_link(repo, job_id):
    return f"{GITHUB_UI_BASE}/{repo}/actions/runs/{job_id}"


def workflow_link(repo, workflow_id):
    return f"{GITHUB_UI_BASE}/{repo}/actions/workflows/{workflow_id}"


def prep_auth(jwt_token, installation_id):
    print("Getting bot access token...")
    token = requests.post(
        f"{GITHUB_API_BASE}/app/installations/{installation_id}/access_tokens",
        headers={"Authorization": f"Bearer {jwt_token}"},
    ).json()["token"]
    auth = {
        "Authorization": f"Token {token}",
        "Accept": "application/vnd.github.v3+json",
    }
    print("Got bot access token!")
    return auth


def wait_for_job(repo, workflow_id, auth):
    start = time.time()
    while time.time() - start < JOB_WAIT_TIMEOUT:
        workflow_runs = requests.get(
            f"{GITHUB_API_BASE}/repos/{repo}/actions/workflows/{workflow_id}/runs?event=workflow_dispatch",
            headers=auth,
        ).json()["workflow_runs"]
        if len(workflow_runs) > 0:
            last_run = workflow_runs[0]
            if last_run["status"] == "in_progress" or last_run["status"] == "queued":
                print(
                    f"Found a running job {last_run['id']} - {job_link(repo, last_run['id'])}"
                )
                return last_run["id"]
        time.sleep(1)
    else:
        print(
            f"Timeout waiting for a job to appear.\nWorkflow summary - {workflow_link(repo, workflow_id)}"
        )
        if len(workflow_runs) > 0:
            print(
                f"The latest job observed: {workflow_runs[0]['id']}, {workflow_runs[0]['name']}, {workflow_runs[0]['event']}, {workflow_runs[0]['status']}"
            )

        sys.exit(1)


def wait_for_job_finish(repo, job_id, auth):
    start = time.time()
    while time.time() - start < JOB_TIMEOUT:
        run = requests.get(
            f"{GITHUB_API_BASE}/repos/{repo}/actions/runs/{job_id}", headers=auth
        ).json()
        if run["status"] == "completed":
            if run.get("conclusion") != "success":
                print(
                    f"Job {job_id} failed (conclusion={run.get('conclusion')}). Aborting.\n"
                    f"See details here - {job_link(repo, job_id)}"
                )
                sys.exit(1)
            print(
                f"The job {job_id} completed (conclusion={run['conclusion']}) in {time.time() - start} seconds.\n"
                f"See details here - {job_link(repo, job_id)}"
            )
            return
        time.sleep(1)
    else:
        print(
            f"Timeout waiting for a job to complete. Last state for {run['id']}: {run['status']}\n"
            f"See details here - {job_link(repo, job_id)}"
        )
        sys.exit(1)


def get_inputs_from_envs():
    return {
        key.rsplit("INPUTS_")[-1].lower(): value
        for key, value in os.environ.items()
        if key.startswith("INPUTS_")
    }


def main():
    private_key = os.environ["APP_PRIVATE_KEY"]
    repo = os.environ["TARGET_REPO"]
    target_workflow = os.environ["TARGET_WORKFLOW"]
    target = os.environ.get("TARGET")
    target_tag = os.environ.get("TAG")
    jwt_token = make_jwt_token(private_key)
    auth = prep_auth(jwt_token, get_installation_id(jwt_token))
    job_inputs = dict()
    if target:
        job_inputs["repo_ref"] = target
    if target_tag:
        job_inputs["tag"] = target_tag
    job_inputs.update(get_inputs_from_envs())

    print(f"Dispatching workflow {target_workflow} with inputs {job_inputs}...")
    res = requests.post(
        f"{GITHUB_API_BASE}/repos/{repo}/actions/workflows/{target_workflow}/dispatches",
        headers=auth,
        json={"ref": "master", "inputs": job_inputs},
    )
    print(
        f"Dispatched workflow {target_workflow}. status={res.status_code}, text={res.text or '<no text>'}!"
    )
    job = wait_for_job(repo, target_workflow, auth)
    wait_for_job_finish(repo, job, auth)


if __name__ == "__main__":
    main()
