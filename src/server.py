import os
import sqlite3
from flask import Flask, request, session, g, redirect, url_for, abort, \
     render_template, flash
from flask_bootstrap import Bootstrap
from urllib import parse
import psycopg2
from flask_sqlalchemy import SQLAlchemy


app = Flask(__name__) # create the application instance :)
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ["DATABASE_URL"]

Bootstrap(app)

# parse.uses_netloc.append("postgres")
# url = parse.urlparse(os.environ["DATABASE_URL"])
#
# conn = psycopg2.connect(
#     database=url.path[1:],
#     user=url.username,
#     password=url.password,
#     host=url.hostname,
#     port=url.port
# )

# app.config.from_object(__name__) # load config from this file , flaskr.py
#
# # Load default config and override config from an environment variable
# app.config.update(dict(
#     DATABASE=os.path.join(app.root_path, 'flaskr.db'),
#     SECRET_KEY='development key',
#     USERNAME='admin',
#     PASSWORD='default'
# ))
# app.config.from_envvar('FLASKR_SETTINGS', silent=True)

@app.route("/")
def hello():
    error=None
    return render_template('layout.html', error=error)

@app.route('/show')
def show_entries():
    # db = get_db()
    # cur = db.execute('select title, text from entries order by id desc')
    # entries = cur.fetchall()
    return render_template('show_entries.html', entries=None)

@app.route('/add', methods=['POST'])
def add_entry():
    if not session.get('logged_in'):
        abort(401)
    # db = get_db()
    # db.execute('insert into entries (title, text) values (?, ?)',
    #              [request.form['title'], request.form['text']])
    # db.commit()
    flash('New entry was successfully posted')
    return redirect(url_for('show_entries'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    error = None
    if request.method == 'POST':
        if request.form['username'] != app.config['USERNAME']:
            error = 'Invalid username'
        elif request.form['password'] != app.config['PASSWORD']:
            error = 'Invalid password'
        else:
            session['logged_in'] = True
            flash('You were logged in')
            return redirect(url_for('show_entries'))
    return render_template('login.html', error=error)

@app.route('/logout')
def logout():
    session.pop('logged_in', None)
    flash('You were logged out')
    return redirect(url_for('show_entries'))



