from flask import request, session, redirect, url_for, abort, \
     render_template, flash
from __init__ import app
from flask import make_response
from functools import wraps, update_wrapper
from datetime import datetime
import uuid
import json
from requests.auth import HTTPBasicAuth
import requests
from distributary.common.dbaccess import db
from distributary.db_manager.models.models import Workflows, WorkflowJobs, DockerWorkflow, SlackWorkflow, SparkWorkflow
from sqlalchemy import inspect

print("Top of server.py")

docker_states = [('tag_push','tagPush', 'TAG_PUSH'),
                 ('tag_del','tagDel', 'TAG_DELETE'),
                 ('man_push','manPush', 'MANIFEST_PUSH'),
                 ('man_del', 'manDel', 'MANIFEST_DELETE'),
                 ('sec_comp','secComp', 'SCAN_COMPLETED'),
                 ('sec_fail','secFail', 'SCAN_FAILED'),
                 ('promote_img','promoteImg', 'PROMOTION')]


# TODO: GET THIS OUT OF HERE!
app.secret_key = 'Chang3M3aSso0nAsp0ss1bl3'


def nocache(view):
    @wraps(view)
    def no_cache(*args, **kwargs):
        response = make_response(view(*args, **kwargs))
        response.headers['Last-Modified'] = datetime.now()
        response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0, max-age=0'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '-1'
        return response

    return update_wrapper(no_cache, view)


@app.route("/")
@nocache
def base_page():
    print("Inside base_page url.")
    error=None
    return render_template('base.html', error=error)


@app.route('/workspace', methods=['GET', 'POST'])
def workspace():
    workspaces = []

    tbl_workspaces = Workflows.query.all()
    for workspace in tbl_workspaces:
        workspaces.append({'name': workspace.name, 'id': workspace.workflowUUID})

    if request.method == 'POST':
        print(request.data)
        ws_uuid = uuid.uuid4()
        UUID = Workflows(workflowUUID=ws_uuid, name=json.loads(request.data))

        db.session.add(UUID)
        db.session.commit()

        workspaces.append({'name':json.loads(request.data), 'id':str(ws_uuid)})

    return json.dumps(workspaces)


@app.route('/components', methods=['GET', 'POST'])
def components():
    components = []
    data = {}

    if request.method == 'POST':
        data = json.loads(request.data)

    if request.method == 'GET':
        print(request.args.get('uuid'))
        data = {'uuid':request.args.get('uuid')}

    workflow = Workflows.query.filter_by(workflowUUID=data['uuid']).first()

    if request.method == 'POST':
        print(data)

        component = None

        if data['component'] == 'docker':
            component = DockerWorkflow(workflow_id=workflow.id)
            component.type = 'docker_workflow'
            component.direction = 'from'

        if data['component'] == 'slack':
            component = SlackWorkflow(workflow_id=workflow.id)
            component.type = 'slack_workflow'
            component.direction = 'to'

        if data['component'] == 'spark':
            component = SparkWorkflow(workflow_id=workflow.id)
            component.type = 'spark_workflow'
            component.direction = 'to'

        if component != None:
            db.session.add(component)
            db.session.commit()
            components.append({'component':data['component'], 'job_id':str(component.id), 'direction': component.direction})

    else:
        if workflow.jobs != None:
            tbl_components = workflow.jobs
        else:
            tbl_components = []

        print(tbl_components)

        for component in tbl_components:
            components.append({'component': component.type, 'job_id': str(component.id), 'direction': component.direction})
            print(component)

    return json.dumps(components)


@app.route('/dockerlogin', methods=['GET'])
def docker_login():
    job = request.args.get('job')
    url = ""

    docker_job = WorkflowJobs.query.filter_by(id=int(job)).first()
    if docker_job != None:
        url = docker_job.dtrUrl

    return render_template('dtr_login.html', saved_URL=url)


@app.route('/dockerrepos', methods=['POST'])
def docker_repos():
    repos = []
    print('dockerrepos:', request.form)

    url = request.form.get('url')
    user = request.form.get('user')
    password = request.form.get('pwd')
    uuid = request.form.get('uuid')
    job = request.form.get('job')

    docker_job = WorkflowJobs.query.filter_by(id=int(job)).first()

    # TODO: It's the Hotel California, you check in but you don't check out
    session['user'] = user
    session['pass'] = password
    session['url'] = url
    session['uuid'] = uuid

    if docker_job != None:
        docker_job.dtrUrl = url
        db.session.add(docker_job)
        db.session.commit()

    payload = {'pageSize': '50'}
    resp = requests.get(url + '/api/v0/repositories', params=payload, auth=HTTPBasicAuth(user, password), verify=False)

    data  = resp.json()['repositories']
    for repo in data:
        repos.append(repo['namespace'] + '/' + repo['name'])

    print(repos)

    return json.dumps(repos)


@app.route('/attributes', methods=['GET'])
def attributes():
    job_id =  request.args.get('job')
    template = 'attr_404.html';

    job = WorkflowJobs.query.filter_by(id=int(job_id)).first()

    if(job.type=='docker_workflow'):
        template='dtr.html'
        return render_template(template, job=job)
    if(job.type=='slack_workflow'):
        template='slack.html'
        return render_template(template, url=job.slackUrl)
    if(job.type=='spark_workflow'):
        template='spark.html'
        return render_template(template)

    return render_template(template)


@app.route('/createwebhook', methods=['POST'])
def create_webhook():
    print(request.form)

    job_id = request.form.get('job')
    job = WorkflowJobs.query.filter_by(id=int(job_id)).first()

    if job.type == 'docker_workflow':
        do_docker_job(request, job)

    if job.type == 'slack_workflow':
        do_slack_job(request, job)

    if job.type == 'spark_workflow':
        do_spark_job(request, job)

    return "ok", 200


@app.route('/post/<uuid>', methods=['POST'])
def hook_up(uuid):
    print('Got webhook call for ', uuid, request.get_json())

    workflow = Workflows.query.filter_by(workflowUUID=uuid).first()

    for job in workflow.jobs:
        if job.direction == 'to':
            if job.type == 'slack_workflow':
                print('Sending job', job.id, 'to Slack with', job.slackUrl)
                # format the text message that will be sent to the Slack channel
                data = request.get_json()
                if job.slackUrl != None:
                    slack_url = job.slackUrl
                    slack_data = {"text": data['type'] + ' ' + data['contents']['namespace'] + ' ' + data['contents']['repository']}
                    response = requests.post(slack_url, data=json.dumps(slack_data), headers={'Content-Type': 'application/json'})
                    print('Slack response:',response.status_code)

    return 'ok', 200


def do_docker_job(request, docker_job):
    docker_job.repository = request.form.get('repos')

    body = {}
    body['endpoint'] = 'https://stark-river-28638.herokuapp.com/post/'+request.form.get('uuid')
    body['key'] = docker_job.repository

    headers = {'Content-Type':'application/json', 'Accept':'application/json'}
    url = session['url']
    user = session['user']
    password = session['pass']

    for state in docker_states:
        if request.form.get(state[0]) != None:
            print("Trying to set: ",state)
            setattr(docker_job, state[1], True)
            body['type']=state[2]

            # TODO: Add the endpoint for the given UUID to the webhooks for the given repo
            api_url = "/api/v0/webhooks/"
            print(api_url)

            resp = requests.post(url + api_url, headers=headers, auth=HTTPBasicAuth(user, password), data=json.dumps(body), verify=False)
            print(body, resp.text)

    db.session.add(docker_job)
    db.session.commit()


def do_slack_job(request, slack_job):
    slack_job.slackUrl = request.form.get('url')
    db.session.add(slack_job)
    db.session.commit()


def do_spark_job(request, spark_job):
    pass


if __name__ == '__main__':
    print("Starting as main application")

    app.run(debug=True, port=5002)

