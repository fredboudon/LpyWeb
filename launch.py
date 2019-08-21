import os
import flask.cli as cli
import webbrowser

os.environ['FLASK_APP'] = 'lpyweb.py'
webbrowser.open_new('http://localhost:5000/')
cli.cli.main(['run'],'lpyweb')
