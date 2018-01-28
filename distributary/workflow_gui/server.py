from flask import request, session, redirect, url_for, abort, \
     render_template, flash
from __init__ import app
from flask import make_response
from functools import wraps, update_wrapper
from datetime import datetime

print("Top of server.py")


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
def workspace():
    print("Inside workspace url.")
    error=None
    return render_template('base.html', error=error)

if __name__ == '__main__':
    print("Starting as main application")
    app.run(debug=True, port=5002)


