#Distributary v0.1 Flask Application

To install -
- pip install -r requirements.txt

To run in Windows/locally - 
- set FLASK_APP=.\distributary\web_gui\server.py
-  python -m flask run

To run in Heroku -
- git push heroku master
- https://stark-river-28638.herokuapp.com/

To run in Heroku from a different branch -
- git push heroku \<branch>:master
`--Note, you may need to use -f to force the branch`

Handy Heroku commands -
- heroku ps
- heroku logs (--tail)

By default, Heroku uses PostgreSQL, so we are going to use that instead of sqlite3 for SQLAlchemy
- Using PostgreSQL 10.3.1

For parity with Heroku, we use the DATABASE_URL environment variable to specify the location of the DB
- for Mac and Linux:
$ export DATABASE_URL=postgres://$(whoami)
- for Windows:
$ set DATABASE_URL=postgres://user:pass@localhost:5432/distributary
- setup environment variables PGUSER & PGPASSWORD

To sync local DB up to heroku DB
- heroku pg:push distributary postgresql-reticulated-77048 --app stark-river-28638
