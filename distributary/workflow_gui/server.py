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

print("Top of server.py")

workspaces = []
docker_states = ['tag_push', 'tag_del', 'man_push', 'man_del', 'sec_comp', 'sec_fail', 'promote_img']

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
    ws_uuid = uuid.uuid4()
    UUID = db.Workflows(uuid=ws_uuid)
    db.session.add(UUID)
    db.session.commit()

    if request.method == 'POST':
        print(request.data)
        data = {'name':json.loads(request.data), 'id':str(ws_uuid)}
        workspaces.append(data)

    return json.dumps(workspaces)


@app.route('/dockerlogin', methods=['GET'])
def docker_login():
    return render_template('dtr_login.html')


@app.route('/dockerrepos', methods=['POST'])
def docker_repos():
    repos = []
    print('dockerrepos:', request.form)

    url = request.form.get('url')
    user = request.form.get('user')
    password = request.form.get('pwd')
    uuid = request.form.get('uuid')

    # TODO: It's the Hotel California, you check in but you don't check out
    session['user'] = user
    session['pass'] = password
    session['url'] = url
    session['uuid'] = uuid

    payload = {'pageSize': '50'}
    resp = requests.get(url + '/api/v0/repositories', params=payload, auth=HTTPBasicAuth(user, password), verify=False)

    data  = resp.json()['repositories']
    for repo in data:
        repos.append(repo['namespace'] + '/' + repo['name'])

    print(repos)

    return json.dumps(repos)


@app.route('/attributes', methods=['POST'])
def attributes():
    attr_type =  request.form.getlist('type')
    template = 'attr_404.html';

    # TODO: Parse the type to get the html fragment to use
    if(attr_type[0]=='docker'):
        template='dtr.html'
    if(attr_type[0]=='slack'):
        template='slack.html'
    if(attr_type[0]=='spark'):
        template='spark.html'

    return render_template(template)


@app.route('/createwebhook', methods=['POST'])
def create_webhook():
    print(request.form)

    for state in docker_states:
        print(state)

    url = session['url']
    user = session['user']
    password = session['pass']

    space = request.form.get('repos')

    # TODO: Add the endpoint for the given UUID to the webhooks for the given repo
    api_url = "/api/v0/repositories/{}/webhooks".format(space)
    print(api_url)

    resp = requests.get(url + api_url, auth=HTTPBasicAuth(user, password), verify=False)

    print(resp.json())

    return "ok", 200

if __name__ == '__main__':
    print("Starting as main application")

    app.run(debug=True, port=5002)

