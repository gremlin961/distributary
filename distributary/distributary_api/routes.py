from __init__ import api
from flask_restplus import Resource
import sys
print(sys.path)

from distributary.common import DistributaryTasker

ns = api.namespace('users', description='Operations related to managing users')
tasker = DistributaryTasker('users')

@ns.route('/')
class UserCollection(Resource):

    def get(self):
        """Returns list of users."""
        return None

    @api.response(201, 'User successfully created.')
    def post(self):
        """Creates a new user."""
        return None, 201


@ns.route('/<int:id>')
@api.response(404, 'User not found.')
class UserDetail(Resource):

    def get(self, id):
        """Returns details of a user."""
        return None

    @api.response(204, 'User successfully updated.')
    def put(self, id):
        """Updates a user."""
        return None, 204

    @api.response(204, 'User successfully deleted.')
    def delete(self, id):
        """Deletes user."""
        return None, 204