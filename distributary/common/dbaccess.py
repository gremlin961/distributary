from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from distributary.workflow_gui import app
import os

# TODO: Get this into secrets
app.config['SQLALCHEMY_DATABASE_URI']='postgres://zyeevjvecouqzr:82a3710c58c9aee4b34edf164aca4d1dc61427b5813ba566d2fd9881e59521d1@ec2-54-83-59-144.compute-1.amazonaws.com:5432/dbpq2vnkm81tr0'
#app.config['SQLALCHEMY_DATABASE_URI']=os.environ['DATABASE_URL']
app.config['SQLALCHEMY_TRACK_MODIFICATIONS']=False

db = SQLAlchemy(app)