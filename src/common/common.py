import os
from flask_sqlalchemy import SQLAlchemy
from flask import Flask, request, session, g, redirect, url_for, abort, \
     render_template, flash
from flask_bootstrap import Bootstrap

app = Flask(__name__) # create the application instance :)
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ["DATABASE_URL"]
Bootstrap(app)

db = SQLAlchemy(app)
