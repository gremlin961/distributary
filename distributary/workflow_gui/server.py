from flask import request, session, redirect, url_for, abort, \
     render_template, flash
from __init__ import app

print("Top of server.py")

@app.route("/")
def workspace():
    print("Inside workspace url.")
    error=None
    return render_template('base.html', error=error)

if __name__ == '__main__':
    print("Starting as main application")
    app.run(debug=True, port=5002)


