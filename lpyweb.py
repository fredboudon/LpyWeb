import os
import time
from flask import Flask
from flask import request, render_template, url_for, redirect, jsonify, session
from flask import Markup
from flask_socketio import SocketIO
	
app = Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
app.secret_key = 'Iamasecretkey'
socketio = SocketIO(app)
LSystem = None

@app.before_request
def make_session_permanent():
    session.permanent = False

if __name__ == '__main__':
	app.run(debug=True)
	#host=140.77.13.200

@socketio.on('disconnect')
def disconnect():
    session.pop('step', None)
    session.pop('currentStep', None)
    session.pop('code', None)

@app.route('/')
def home():
	return render_template('home.html')

@app.route('/editor.html')
def editor():
    return render_template('result.html')


#When Run is clicked, the server receives the code, derive and interpret the LString and sends the result.

@app.route('/run', methods=['POST'])
def run():
	disconnect()
	import openalea.lpy as lpy
	l = lpy.Lsystem()
	code = request.form['code']
	code = code.encode('ascii', 'ignore')
	try:
		l.set(code)
	except:
		return jsonify({'error' : 'Syntax error'})
	lstring = l.derive()
	ilstring = l.interpret(lstring)
	txtlstring = str(ilstring)
	return jsonify({'LString' : txtlstring})

#When Step is clicked, the server receives the code, derive and interpret one time the LString, sends the result and keeps the new LString in the session array.

@app.route('/step', methods=['POST'])
def step():
	import openalea.lpy as lpy
	global LSystem
	code = request.form['code']
	code = code.encode('ascii', 'ignore')

	if session.get('step') is not None:
		if code != session['code']:
			l = lpy.Lsystem()
			session['code'] = code
			session['step'] = int(request.form['step'])
			session['currentStep'] = 1
			try:
				l.set(code)
			except:
				return jsonify({'error' : 'Syntax error'})
			lstring = l.derive(session['currentStep'])
			ilstring = l.interpret(lstring)
			txtlstring = str(ilstring)
			LSystem = l
			return jsonify({'LString' : txtlstring})

		else:
			session['currentStep'] += 1
			lstring = LSystem.derive(session['currentStep'])
			ilstring = LSystem.interpret(lstring)
			txtlstring = str(ilstring)
			if session['currentStep'] == session['step']:
				disconnect()
			return jsonify({'LString' : txtlstring})
	else:
		l = lpy.Lsystem()
		session['code'] = code
		session['step'] = int(request.form['step'])
		session['currentStep'] = 1
		try:
			l.set(code)
		except:
			return jsonify({'error' : 'Syntax error'})
		lstring = l.derive(session['currentStep'])
		ilstring = l.interpret(lstring)
		txtlstring = str(ilstring)
		with lock:
			LSystem = l
		return jsonify({'LString' : txtlstring})
    
@app.route('/about.html')
def about():
    return render_template('about.html')

#Sometimes Flask doesn't interpret static files updates.
#This function clears the issue.

@app.context_processor
def override_url_for():
    return dict(url_for=dated_url_for)

def dated_url_for(endpoint, **values):
    if endpoint == 'static':
        filename = values.get('filename', None)
        if filename:
            file_path = os.path.join(app.root_path,
                                     endpoint, filename)
            values['q'] = int(os.stat(file_path).st_mtime)
    return url_for(endpoint, **values)
