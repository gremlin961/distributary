from flask import request, session, redirect, url_for, abort, \
     render_template, flash
from __init__ import app
from flask import make_response
from functools import wraps, update_wrapper
from datetime import datetime
import uuid
import json

print("Top of server.py")

workspaces = []

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
    if request.method == 'POST':
        print(request.data)
        data = {'name':json.loads(request.data), 'id':str(ws_uuid)}
        workspaces.append(data)

    return json.dumps(workspaces)


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


if __name__ == '__main__':
    print("Starting as main application")
    app.run(debug=True, port=5002)

