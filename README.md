# LpyWeb
How to use LpyWeb project :

1- If you don't have Conda installed, download it from here (https://docs.conda.io/projects/conda/en/latest/user-guide/install/index.html)

2- Then you need to create L-Py environnement by typing this command in a terminal :
conda create -n lpy openalea.lpy boost=1.66 'mpfr<4' -c openalea

3- Activate the environnement wih the command : conda activate lpy

4- Clone the LPyWeb project anywhere you want and go to the root of the LpyWeb directory

5- Prepare the flask module with the command: "export FLASK_APP=communication.py" On Linux or Mac or "set FLASK_APP=communication.py" on Windows

6- Launch the server with the command: "flask run".

7- Do CTRL + left click on the URL appearing on the shell.

8- Enter an axiom and some rules as an input text or upload a .lpy file, and submit your code.

9- You can save your program and download it using the Save button.

If you want to access to the application with other machines, you can run it with the command : flask run --host=IP_HOST_MACHINE.
(IP_HOST_MACHINE is the IP adress of the machine which run the flask application)
You can check the IP adress using : "ip a show" or "ifconfig" (or ipconfig on Windows)