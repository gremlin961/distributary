from flask import request, session, redirect, url_for, abort, \
     render_template, flash
from sqlalchemy.exc import IntegrityError

from distributary.common.worker import db, app
from distributary.db_manager.models import DisUsers

db.create_all()


@app.route("/")
def hello():
    error=None
    return render_template('layout.html', error=error)

@app.route('/show')
def show_entries():
    # db = get_db()
    # cur = db.execute('select title, text from entries order by id desc')
    # entries = cur.fetchall()
    error = None
    try:
        admin = DisUsers(username='admin', email='admin@example.com')
        db.session.add(admin)
        db.session.commit()
    except IntegrityError as e:
        db.session.rollback()
        if "dis_users_username_key" in str(e):
            error = "User already exists."
        else:
            error = str(e)
    return render_template('layout.html', error=error)

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



