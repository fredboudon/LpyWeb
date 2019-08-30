import os
import sys
import openalea.lpy as lpy
import openalea.plantgl.all as pgl
from flask import Flask
from flask import request, render_template, url_for, redirect, jsonify, session
from flask import Markup
from flask_socketio import SocketIO
from threading import Lock
	
app = Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
app.secret_key = 'Iamasecretkey'
socketio = SocketIO(app)
LSystem = None
lock = Lock()

@app.before_request
def make_session_permanent():
    session.permanent = False

if __name__ == '__main__':
	app.run(debug=True)
	#host=140.77.193.122

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
	out = sys.stdout
	outlog = open('outlog.txt', 'w')
	sys.stdout = outlog

	disconnect()
	l = lpy.Lsystem()
	code = request.form['code']
	code = code.encode('ascii', 'ignore')

	try:
		l.set(code)
	except:
		outlog.close()
		sys.stdout = out
		outlog = open('outlog.txt', 'r')
		output = outlog.read()
		return jsonify({'error': "Syntax Error", 'output': output})

	lstring = l.derive()
	ilstring = l.interpret(lstring)
	txtlstring = str(ilstring)
	# txtlstring = lstringtojson(ilstring)

	outlog.close()
	sys.stdout = out

	outlog = open('outlog.txt', 'r')
	output = outlog.read()
	return jsonify({'LString' : txtlstring, 'output': output})

#When Step is clicked, the server receives the code, derive and interpret one time the LString, sends the result and keeps the new LString in the session array.

@app.route('/step', methods=['POST'])
def step():
	global LSystem
	code = request.form['code']
	code = code.encode('ascii', 'ignore')
	step = 0

	if session.get('step') is not None:
		if code != session['code']:
			l = lpy.Lsystem()
			session['code'] = code
			try:
				l.set(code)
			except:
				return jsonify({'error' : 'Syntax error'})

			session['step'] = l.derivationLength
			session['currentStep'] = 1
			lstring = l.derive(session['currentStep'])
			ilstring = l.interpret(lstring)
			txtlstring = str(ilstring)
			LSystem = l
			return jsonify({'LString' : txtlstring, 'currentStep' : session['currentStep'], 'step' : session['step']})

		else:
			with lock:
				session['currentStep'] += 1
				lstring = LSystem.derive(session['currentStep'])
				ilstring = LSystem.interpret(lstring)
				txtlstring = str(ilstring)
				if session['currentStep'] < session['step']:
					return jsonify({'LString' : txtlstring, 'currentStep' : session['currentStep'], 'step' : session['step']})
				else:
					step = session['step']
					disconnect()
					return jsonify({'LString' : txtlstring, 'currentStep' : step, 'step' : step})
				
	else:
		l = lpy.Lsystem()
		session['code'] = code
		try:
			l.set(code)
		except:
			return jsonify({'error' : 'Syntax error'})

		session['step'] = l.derivationLength
		session['currentStep'] = 1
		lstring = l.derive(session['currentStep'])
		ilstring = l.interpret(lstring)
		txtlstring = str(ilstring)
		LSystem = l
		return jsonify({'LString' : txtlstring, 'currentStep' : session['currentStep'], 'step' : session['step']})

#When Rewind is clicked, the server receives the code, interpret only the Axiom of the LString and sends the result.
@app.route('/rewind', methods=['POST'])
def rewind():
	disconnect()
	l = lpy.Lsystem()
	code = request.form['code']
	code = code.encode('ascii', 'ignore')
	try:
		l.set(code)
	except:
		return jsonify({'error' : 'Syntax error'})
	lstring = l.axiom
	ilstring = l.interpret(lstring)
	txtlstring = str(ilstring)
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

#Fred's code
#Converts curves and LStrings into JSON

# def iscurve(c):
#     if isinstance(c, pgl.Curve2D) : return True
#     return isinstance(c, pgl.LineicModel)
# 
# def curvetojson(c):
#     # calcule des points et les transforme en chaine de caractere
#     deltau = (c.lastKnot - c.firstKnot) / c.stride
#     return '['+','.join([str(tuple(c.getPointAt(c.firstKnot + i * deltau))) for  i in range(c.stride+1)])+']'
# 
# def lstringtojson(lstring):
#     lstrrepr = ''
#     for module in lstring:
#        modrepr = module.name +'(' + ','.join([str(param) if not iscurve(param) else curvetojson(param) for param in module])
#        lstrrepr += ' '+modrepr
#     return lstrrepr