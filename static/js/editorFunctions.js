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
function clearEditor(editor) {
	if(confirm("Do you really want to reset the text editor and the 3D render ?")) {
		editor.getSession().setValue(sessionStorage.getItem('genesisCode'));
		document.getElementById('runCode').click();
		unlockButtons();
	}
}

//Call the hiddenUpload function. It was necessary to create a hidden file type button in order to add style to this one.
function upload() {
	document.getElementById('hiddenButton').click();
}
//Import a file and write it's content in the text editor
function hiddenUpload(editor) {
	let fileInput = document.getElementById('hiddenButton');
	let file = fileInput.files[0];
	console.log(file);
	let uploadFiletype = file.name.split('.')[1];
			
	if (!(uploadFiletype == 'lpy')){
		alert("The imported file isn't a .lpy file. Please choose another one.");
	}
	else{
		fileInput.addEventListener('change', function() {
			let reader = new FileReader();
			reader.addEventListener('load', function() {
				editor.getSession().setValue(reader.result);
			});
			reader.readAsText(file, 'UTF-8');
		});
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