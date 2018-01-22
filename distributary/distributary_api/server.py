from flask_restplus import Resource
from flask import Blueprint
from __init__ import api, app
from routes import ns

def initialize_app(flask_app):
    blueprint = Blueprint('api', __name__, url_prefix='/api')
    api.init_app(blueprint)
    api.add_namespace(ns)
    flask_app.register_blueprint(blueprint)

if __name__ == '__main__':
    initialize_app(app)
    app.run(debug=True, port=5001)
