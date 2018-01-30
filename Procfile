web: gunicorn --pythonpath distributary/web_gui server:app --log-file -
worker: gunicorn --pythonpath distributary/workflow_gui server:app -p $PORT --log-file -
