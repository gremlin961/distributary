from distributary.common.dbaccess import db


class DisUsers(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)

    def __repr__(self):
        return '<User %r>' % self.username


class Workflows(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    workflowUUID = db.Column(db.String(40), unique=True, nullable=False)
    name = db.Column(db.String(40), nullable=False)
    jobs = db.relationship('WorkflowJobs', backref='workflows', lazy=True)

    def __repr__(self):
        return 'Worker: <%r>, Name: <%r>' % self.workflowUUID, self.name


class WorkflowJobs(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    type = db.Column(db.String(40))
    workflow_id = db.Column(db.Integer, db.ForeignKey('workflows.id'), nullable=False)
    direction =  db.Column(db.String(10), nullable=False)

    __mapper_args__ = {
        'polymorphic_identity':'workflow_jobs',
        'polymorphic_on':type
    }


class DockerWorkflow(WorkflowJobs):
    id = db.Column(db.Integer, db.ForeignKey('workflow_jobs.id'), primary_key=True)
    __mapper_args__ = {'polymorphic_identity': 'docker_workflow' }

    dtrUrl = db.Column(db.String(250))
    repository = db.Column(db.String(40))

    tagPush = db.Column(db.Boolean)
    tagDel = db.Column(db.Boolean)
    manPush = db.Column(db.Boolean)
    manDel = db.Column(db.Boolean)
    secComp = db.Column(db.Boolean)
    secFail = db.Column(db.Boolean)
    promoteImg = db.Column(db.Boolean)


    def __repr__(self):
        return 'Docker repository <%r>' % self.repository

class SlackWorkflow(WorkflowJobs):
    id = db.Column(db.Integer, db.ForeignKey('workflow_jobs.id'), primary_key=True)
    __mapper_args__ = {'polymorphic_identity': 'slack_workflow' }

    slackUrl = db.Column(db.String(250))


class SparkWorkflow(WorkflowJobs):
    id = db.Column(db.Integer, db.ForeignKey('workflow_jobs.id'), primary_key=True)
    __mapper_args__ = {'polymorphic_identity': 'spark_workflow' }

    sparkUrl = db.Column(db.String(250))


class ServiceNowWorkflow(WorkflowJobs):
    id = db.Column(db.Integer, db.ForeignKey('workflow_jobs.id'), primary_key=True)
    __mapper_args__ = {'polymorphic_identity': 'service_now_workflow' }

    serviceNowUrl = db.Column(db.String(250))
    user = db.Column(db.String(30))
    password = db.Column(db.String(40))
    company = db.Column(db.String(40))



print('Creating Tables')
db.create_all()
