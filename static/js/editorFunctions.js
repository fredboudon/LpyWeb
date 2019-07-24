//Functions loaded when the page is open/ready to use
$(document).ready(function() {
	//Initialise popovers
	$('[data-toggle="popover"]').popover();
	$('.popover-dismiss').popover({
 		trigger: 'focus'
	});

	$("#stop").attr("disabled", true);
	$("#stop").attr("title", "There is no animation currently processing");

	//Initialise the turtle and the render
	var dTurtle = new drawTurtle();
	var wTurtle = new webTurtle(dTurtle);
    Init(dTurtle, wTurtle);

    initialiseColorPanel(dTurtle);

    //Add onclick events for some buttons
    document.getElementById('resetCamera').onclick = function() {
		dTurtle.ResetCamera();
	};

	document.getElementById('addColor').onclick = function() {
		createNewColor(dTurtle);
	};

	document.getElementById('deleteColor').onclick = function() {
		deleteLastColor(dTurtle);
	};

	document.getElementById("colorBackground").onchange = function() {
		changeBackgroundColor(dTurtle);
	}
	
	//Creation of the Ajax Requests for Run, Step and Rewind
	if(document.getElementById('runCode')) {
		document.getElementById('runCode').onclick = function(event) {
			$.ajax({
				data : {
					code : $('textarea[name="code"]').val()
				},
				type : "POST",
				url : '/run',
				success: function(data) {

					dTurtle.DeleteTrees();
					wTurtle.Reset(dTurtle);

					$('#printOutput').val(data.output);
					/*if(data.output != undefined) {
						window.open("output.html", "LPyWeb Output", "resizable=yes");
					}*/
					
					if(data.error != undefined) {
						console.log(data.error);
					}else {
						display(dTurtle, wTurtle, data.LString);
					}
				},
				error: function(xhr) {
					console.log(xhr.statusText + xhr.responseText);
				}
			});
			event.preventDefault();
		};
	}

	if(document.getElementById('stepCode')) {
		document.getElementById('stepCode').onclick = function(event) {
			var lines = $('textarea[name="code"]').val().split(/\r\n|\n|\r/);
			var derivation = 1;
			lines.forEach(function(line){
				if(line.includes("derivation length:")){
					return derivation = parseInt(line.split(" ")[2], 10);
				}else {
					return derivation;
				}
			});
			
			$('step').val(derivation);

			$.ajax({
				data : {
					code : $('textarea[name="code"]').val(),
					step: derivation
				},
				type : "POST",
				url : '/step',
				success: function(data) {
					dTurtle.DeleteTrees();
					wTurtle.Reset(dTurtle);
					if(data.error) {
						display(dTurtle, wTurtle, data.error);
					}
					else {
						$('#step').val(data.step);
						$('#currentStep').val(data.currentStep);
						display(dTurtle, wTurtle, data.LString);
					}
				}
			});
			event.preventDefault();
		};
	}

	if(document.getElementById('rewind')) {
		document.getElementById('rewind').onclick = function(event) {
			$.ajax({
				data : {
					code : $('textarea[name="code"]').val()
				},
				type : "POST",
				url : '/rewind',
				success: function(data) {
					dTurtle.DeleteTrees();
					wTurtle.Reset(dTurtle);
					if(data.error) {
						display(dTurtle, wTurtle, data.error);
					}else {
						display(dTurtle, wTurtle, data.LString);
					}
				}
			});
			event.preventDefault();
		};
	}
});

//Function that unlocks the action buttons (Run, Step, Animate and Rewind) after the end of the current animation
function unlockButtons() {
	$("#runCode").attr("disabled", false);
	$("#runCode").attr("title", "Run your program and display the render.");

	$("#rewind").attr("disabled", false);
	$("#rewind").attr("title", "Run only the Axiom of the LSystem.");

	$("#stepCode").attr("disabled", false);
	$("#stepCode").attr("title", "Run your program step by step.");

	$("#animate").attr("disabled", false);
	$("#animate").attr("title", "Play the growth animation.");

	$("#stop").attr("disabled", true);
	$("#stop").attr("title", "There is no animation currently processing");
}

//Clear the code editor and the render
function clearEditor(editor, mode) {
	if(mode == "addTab") {
		editor.getSession().setValue(sessionStorage.getItem('genesisCode'));
		$('#runCode').click();
		unlockButtons();
	}else {
		if(confirm("Do you really want to reset the text editor and the 3D render ?")) {
			editor.getSession().setValue(sessionStorage.getItem('genesisCode'));
			$('#runCode').click();
			unlockButtons();
		}
	}
}

/*Styles can't be given to a type=file button. 
In order to do so, I hid this button and I created a normal one which press the file button when pressed itself.*/
function upload() {
	document.getElementById('hiddenButton').click();
}

/*Takes the editor and the array of sessions in parameters.
upload a file in a new tab and display it's content in the editor.*/
function hiddenUpload(editor, sessions) {
	let fileInput = document.getElementById('hiddenButton');
	let file = fileInput.files[0];
	let uploadFiletype = file.name.split('.')[1];
			
	if (!(uploadFiletype == 'lpy')){
		alert("The imported file isn't a .lpy file. Please choose another one.");
	}
	else{
		let reader = new FileReader();
		reader.onloadend = function() {
			addNewTab(editor, sessions, reader.result, file.name);
		};
		reader.readAsText(file, 'UTF-8');
		$('#hiddenButton').val('');
	}
}

//Add the current text in the code editor in a file and download it with the name given in the modal.
function downloadFile(editor) {
	document.getElementById("modalSaveButton").setAttribute('data-dismiss', 'modal');
	let element = document.createElement('a');
	let inputName = "" + document.getElementById('filename').value;
	if(inputName.length == 0){
		document.getElementById("modalSaveButton").removeAttribute('data-dismiss', 'modal');
	}else {
		if(!(inputName.split('.')[1] == 'lpy')) {
			inputName = inputName + ".lpy";
		}
		element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(editor.getSession().getValue()));
		element.setAttribute('download', inputName);
		element.style.display = 'none';
		document.body.appendChild(element);
		element.click();
		document.body.removeChild(element);
	}
}

//Launch the animation. In fact, this function sends multiple Step Ajax requests.
function animate() {

	$("#stop").attr("disabled", false);
	$("#stop").attr("title", "Stop the current animation.");

	$("#runCode").attr("disabled", true);
	$("#runCode").attr("title", "You can't use Run when an animation is in progress.");

	$("#rewind").attr("disabled", true);
	$("#rewind").attr("title", "You can't use Rewind when an animation is in progress.");

	$("#stepCode").attr("disabled", true);
	$("#stepCode").attr("title", "You can't use Step when an animation is in progress.");

	$("#animate").attr("disabled", true);
	$("#animate").attr("title", "You can't use Animate when an animation is in progress.");
	
	var speed = parseInt($('#animationSpeed').val(), 10);
	if(isNaN(speed)) {
		speed = 500;
	}
	if(speed < 50) {
		speed = 50
	}

	$('#stepCode').click();

	var interval = setInterval(function() {
		var derivation = parseInt($('#step').val(), 10);
		var currentStep = parseInt($('#currentStep').val(), 10);

		if(currentStep < derivation) {
			$('#stepCode').click();
		}

	    if(currentStep === derivation) {
	    	clearInterval(interval);
	    	unlockButtons();
			$("#runCode").click();
	    }

	    if($('#stop').data('clicked')) {
	    	clearInterval(interval);
	    	unlockButtons();
	    	$('#stop').data('clicked', false);
	    	console.log("You are at the " + (currentStep + 1) + "th derivation of the LSystem.");
	    }

	}, speed);
}

//Stop the current animation (if there is one, else the Stop button is disabled)
function stop() {
	$("#stop").click(function(){
    	$(this).data('clicked', true);
	});
	$("#stop").click();
	$("#stop").attr("disabled", true);
	$("#stop").attr("title", "There is no animation currently processing");
}

function displayParameters() {
	if($("#paramFields").hasClass("paramHidden")) {
		$("#paramFields").removeClass("paramHidden");
		$("#colCanvas").removeClass("col-7");
		$("#colCanvas").addClass("col-6");
		$("#colTextEditor").removeClass("col-5");
		$("#colTextEditor").addClass("col-4");

	}else {
		$("#paramFields").addClass("paramHidden");
		$("#colCanvas").removeClass("col-6");
		$("#colCanvas").addClass("col-7");
		$("#colTextEditor").removeClass("col-4");
		$("#colTextEditor").addClass("col-5");
	}
}

//Create inputs for the default turtle colors
function initialiseColorPanel(drawTurtle) {
	for (let i in drawTurtle.materialColors) {
		var colorValue = drawTurtle.materialColors[i].name.slice(0, 7);
		var colorId = "color_" + i;
		var colorInput = '<input type="color"  id="' + colorId + '" value="' + colorValue + '" title="Color ' + i + '" />';
		document.getElementById('addColor').insertAdjacentHTML('beforebegin', colorInput);
		document.getElementById(colorId).addEventListener("change", function() {
			drawTurtle.materialColors[i].diffuseColor = new BABYLON.Color4.FromHexString(this.value + "FF");
		});
	}
}

//Add a new input when a color is created (via the "+" button)
function createNewColor(drawTurtle) {

	var colorId = "color_" + (drawTurtle.materialColors.length);
	var newColor = '<input type="color" id="' + colorId + '" value="#FFFFFF" title="Color '+ drawTurtle.materialColors.length + '" />';
	document.getElementById('addColor').insertAdjacentHTML('beforebegin', newColor);

	var mat = new BABYLON.StandardMaterial(colorId, drawTurtle.scene);
    mat.diffuseColor = new BABYLON.Color4.FromHexString(document.getElementById(colorId).value + "FF");
    mat.specularColor = new BABYLON.Color4.FromHexString("#00000000");
    mat.emissiveColor = new BABYLON.Color4.FromHexString("#00000000");
    mat.ambientColor = new BABYLON.Color4.FromHexString("#00000000");
    drawTurtle.materialColors.push(mat);

    document.getElementById(colorId).addEventListener("change", function() {
		drawTurtle.materialColors[colorId.split('_')[1]].diffuseColor = new BABYLON.Color4.FromHexString(this.value + "FF");
	});
}

//Delete the last color input (when "-" is pressed)
function deleteLastColor(drawTurtle) {
	if((drawTurtle.materialColors.length) != 0) {
		var colorId = "color_" + (drawTurtle.materialColors.length - 1);
		var deletedColor = drawTurtle.materialColors.pop();
		document.getElementById(colorId).parentNode.removeChild(document.getElementById(colorId));
	}
}

//Change the renderer background color according to the color selected
function changeBackgroundColor(drawTurtle) {
	var colorValue = document.getElementById("colorBackground").value;
	drawTurtle.scene.clearColor = new BABYLON.Color3.FromHexString(colorValue);
}

/*Removes the active class of all tabs*/
function removeActive() {
	$("#tabList").children().each(function() {
		this.removeAttribute('class', 'active');
	});
}

/*Takes the editor, the array of sessions, the base code (with Axiom: ...) to initialise the new editor session and a filename (optional) in case of upload.
Create an new tab with a new editor session.*/
function addNewTab(editor, sessions, code, filename) {

	//Create a new session and save it in the array
	EditSession = ace.require("ace/edit_session").EditSession;
	var sess = new EditSession(sessionStorage.getItem('genesisCode'), "ace/mode/python");
	sess.on('change', function(){
		$('textarea[name="code"]').val(sess.getValue());
	});
	editor.setSession(sess);
	sess.setValue(code);
	sessions.push(sess);

	var addTab = document.getElementById("addTab");

	//Create a new tab
	var newLi = document.createElement("LI");
	newLi.setAttribute('role', 'presentation');
	var index = $("#tabList").children().length - 1;
	newLi.id = "tab-" + index;

	//Create the new tab link
	var newTab = document.createElement("A")
	newTab.href = '#';
	newTab.style.color = "#8ec07c";
	newTab.style.align = "right";
	newTab.style.clear = "both";
	newTab.addEventListener('click', function() {
		removeActive();
		editor.setSession(sessions[this.parentNode.id.split('-')[1]]);
		$('textarea[name="code"]').val(editor.getSession().getValue());
		this.parentNode.setAttribute('class', 'active');
		$('#rewind').click();
	})
	//Create the tab close button
	var closeTab = document.createElement("A");
	closeTab.className = 'fa fa-times';
	closeTab.href = '#';
	closeTab.style.float = "left";
	closeTab.style.margin = "5px";
	closeTab.style.color = "#B22222";
	closeTab.addEventListener('click', function() {
		var liToRemove = this.parentNode;
		var liId = liToRemove.id;
		//If the deleted tab was the current one, the active tab becomes the previous one.
		if (liToRemove.classList.contains("active")) {
			liToRemove.removeAttribute('class', 'active');
			editor.setSession(sessions[liId.split('-')[1]-1]);
			var idPreviousLi = "tab-" + (liId.split('-')[1]-1).toString();
			document.getElementById(idPreviousLi).setAttribute('class', 'active');
			document.getElementById(idPreviousLi).firstChild.click();
		}
		//Delete the tab and it's session.
		sessions.splice(liId.split('-')[1], 1);
		//All tabs after the deleted one must decrease their id by one
		$(liToRemove).nextUntil(addTab).each(function() {
			this.id = "tab-" + (this.id.split('-')[1] - 1);
		});
		liToRemove.remove();
	});
	//Append all elements at their right place.
	newLi.appendChild(closeTab);

	var newTabText = document.createElement('P');
	newTabText.style.float = "left";
	newTab.appendChild(newTabText);
	newLi.insertBefore(newTab, closeTab);

	if(filename === undefined){
		newTabText.innerHTML = "New Tab (" + newTabText.parentNode.parentNode.id.split("-")[1] + ")";
		clearEditor(editor, "addTab");
	}else {
		newTabText.innerHTML = filename;
		$('#rewind').click();
	}
	removeActive();
	newTab.parentNode.setAttribute('class', 'active');

	//Add the new tab in the tab list.
	addTab.parentNode.insertBefore(newLi, addTab);
}

function activateRenderTab() {
	var renderTab = document.getElementById("renderTab").parentNode;
	var render = document.getElementById("renderCanvas");
	var outputTab = document.getElementById("outputTab").parentNode;
	var output = document.getElementById("printOutput");
	var clear = document.getElementById("clearConsole");
	if (!(renderTab.classList.contains("active"))){
		clear.style.display = "none";
		output.style.display = "none";
		outputTab.removeAttribute('class', 'active');
		renderTab.setAttribute('class', 'active');
		render.style.display = "";
	}
}

function activateOutputTab() {
	var outputTab = document.getElementById("outputTab").parentNode;
	var output = document.getElementById("printOutput");
	var renderTab = document.getElementById("renderTab").parentNode;
	var render = document.getElementById("renderCanvas");
	var clear = document.getElementById("clearConsole");
	if (!(outputTab.classList.contains("active"))){
		render.style.display = "none";
		renderTab.removeAttribute('class', 'active');
		outputTab.setAttribute('class', 'active');
		output.style.display = "";
		clear.style.display = "";
	}
}

function addVariable() {
	var regex = /^[a-zA-Z]+[a-zA-Z0-9_-]*/;
	if ( !(regex.test(($('#variableName').val()))) || ($('#variableValue').val().length === 0) ) {
		document.getElementById('addVariable').removeAttribute('type', 'reset')
		document.getElementById('missingWarning').style.display = "";
	}else {
		document.getElementById('addVariable').setAttribute('type', 'reset')
		document.getElementById('missingWarning').style.display = "none";
		var newRow = document.createElement("TR");
		var nameCell = document.createElement("TD");
		var nameSpan = document.createElement("SPAN");
		var nameText = $('#variableName').val();
		nameSpan.insertAdjacentHTML('afterbegin', nameText);
		var nameInput = document.createElement("INPUT");
		nameInput.type = "hidden";
		nameInput.setAttribute('value', nameText);
		nameInput.setAttribute('pattern',"^[a-zA-Z][a-zA-Z0-9_-]*");
		nameInput.setAttribute('required', 'true');
		nameCell.appendChild(nameInput);
		nameCell.appendChild(nameSpan);

		$(nameCell).dblclick(function() {
			$(this).children("span").remove();
			this.firstChild.type = "text";
			$(this).children("input").focus();
		});

		$(nameCell).focusout(function() {
			let paramName = this.firstChild.value;
			if(regex.test(paramName)) {
				document.getElementById('wrongParamName').style.display = "none";
				this.firstChild.type = "hidden";
				let newSpan = document.createElement("SPAN");
				newSpan.insertAdjacentHTML('afterbegin', paramName);
				this.appendChild(newSpan);
			}else {
				document.getElementById('wrongParamName').style.display= "";
			}
		});

		var valueCell = document.createElement("TD");
		var valueSpan = document.createElement("SPAN");
		var valueNumber = $('#variableValue').val();
		valueSpan.insertAdjacentHTML('afterbegin', valueNumber);
		var valueInput = document.createElement("INPUT");
		valueInput.type = "hidden";
		valueInput.setAttribute('value', valueNumber);
		valueInput.setAttribute('required', 'true');
		valueCell.appendChild(valueInput);
		valueCell.appendChild(valueSpan);

		$(valueCell).dblclick(function() {
			$(this).children("span").remove();
			this.firstChild.type = "number";
			$(this).children("input").focus();
		});

		$(valueCell).focusout(function() {
			this.firstChild.type = "hidden";
			let paramValue = this.firstChild.value;
			let newSpan = document.createElement("SPAN");
			newSpan.insertAdjacentHTML('afterbegin', paramValue);
			this.appendChild(newSpan);
		});

		var actionCell = document.createElement("TD");
		var deleteVar = document.createElement("A");
		deleteVar.className = 'fa fa-times';
		deleteVar.href = '#';
		deleteVar.style.color = "#B22222";
		deleteVar.addEventListener('click', function() {
			this.parentNode.parentNode.remove();
		});
		actionCell.appendChild(deleteVar);
		newRow.appendChild(actionCell);

		newRow.insertBefore(valueCell, actionCell);
		newRow.insertBefore(nameCell, valueCell);
		document.getElementById("variableTable").appendChild(newRow);
	} 	
}