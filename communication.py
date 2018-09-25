from flask import Flask
from flask import request, render_template, url_for, redirect
from flask import Markup
	
app = Flask(__name__)

@app.route('/')
def index():
    return redirect(url_for('index_html'))

@app.route('/index.html')
def index_html():
    #return  file('index.html').read()
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
