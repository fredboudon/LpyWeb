import os
from flask import Flask
from flask import request, render_template, url_for, redirect, jsonify, session
from flask import Markup
from flask_socketio import SocketIO, emit
	
app = Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
app.secret_key = 'Iamasecretkey'
socketio = SocketIO(app)

@app.before_request
def make_session_permanent():
    session.permanent = False

if __name__ == '__main__':
	app.run(debug=True)
	#host=140.77.13.200

#@socketio.on('disconnect')

@app.route('/')
def home():
	return render_template('home.html')

@app.route('/editor.html')
def editor():
    return render_template('result.html')

@app.route('/simulate', methods=['POST'])
def simulate():
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
	return jsonify({'LString' : txtlstring, 'code' : code})
    
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
