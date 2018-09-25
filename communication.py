from flask import Flask
from flask import request
from flask import render_template
from flask import Markup
	
app = Flask(__name__)

@app.route('/')
def index():
    return 'Index Page'

@app.route('/interpret/<name>', methods=['GET', 'POST'])
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
		return render_template('result.html', name=txtlstring)
    else:
        return 'error then return code'
