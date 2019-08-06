# LPyWeb

## What is LPyWeb ?
> LPyWeb is the Web alternative of the L-Py software. It allows you to make your simulations online and quickly.
It uses the L-Py language which mixes up formal grammar with Python in order to describe plant growth.

<hr>

## How to use LPyWeb project ?

1- If you don't have Conda installed, download it from [here](https://docs.conda.io/projects/conda/en/latest/user-guide/install/index.html)

2- Then you need to create L-Py environnement by typing this command in a terminal :
conda create -n lpy openalea.lpy boost=1.66 'mpfr<4' -c openalea

3- Activate the environnement wih the command : conda activate lpy

4- Install "Flask" and "flask-socketio" packages on lpy environnement using "conda install PACKAGE_NAME"

5- Clone the LPyWeb project anywhere you want and go to the root of the LpyWeb directory

6- Prepare the flask module with the command: "export FLASK_APP=lpyweb.py" On Linux or Mac or "set FLASK_APP=lpyweb.py" on Windows

7- Launch the server with the command: "flask run".

8- Do CTRL + left click on the URL appearing on the shell.

9- Enter an axiom and some rules as an input text or upload a .lpy file, and submit your code.

10- You can save your program and download it using the Save button.

## How to share LPyWeb with other users ?

If you want to access to the application with other machines without re-installing all the project, you can run it with the command : flask run --host=IP_HOST_MACHINE.
(IP_HOST_MACHINE is the IP adress of the machine which run the flask application)
You can check the IP adress using : "ip a show" or "ifconfig" (or ipconfig on Windows)
Then you just have to enter http://IP_HOST_MACHINE:5000 in your navigator to have access to LPyWeb. However, the host machine and the client ones must be connected on the same network.

An other way is to use [ngrok](https://ngrok.com/) to share your localhost with other users.