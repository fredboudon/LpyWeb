import os
from flask import Flask
from flask import request, render_template, url_for, redirect
from flask import Markup
	
app = Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

@app.route('/')
def home():
	return render_template('home.html')

@app.route('/editor.html')
def editor():
    return render_template('result.html', name='', interpreter = url_for("interpret"), code = 'Axiom:\n\nderivation length: 1\nproduction:\n\ninterpretation:\n\nendlsystem\n'  )

@app.route('/interpret.html', methods=['GET', 'POST'])
def interpret(name=None):
    if request.method == 'POST':
		import openalea.lpy as lpy
		l = lpy.Lsystem()
		code = request.form['code']
		code = code.encode('ascii', 'ignore')
		try:
			l.set(code)
		except:
			return render_template('result.html', name='Syntax error')
		lstring = l.derive()
		ilstring = l.interpret(lstring)
		txtlstring = str(ilstring)
		return render_template('result.html', name=txtlstring, interpreter = url_for("interpret"), code = code  )
    else:
        return 'error then return code'

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