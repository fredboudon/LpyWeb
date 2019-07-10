$(document).ready(function() {
	$('[data-toggle="popover"]').popover();
	$('.popover-dismiss').popover({
 		trigger: 'focus'
	});

	$("#stop").attr("disabled", true);
	$("#stop").attr("title", "There is no animation currently processing");

	var dTurtle = new drawTurtle();
	var wTurtle = new webTurtle(dTurtle);
    Init(dTurtle, wTurtle);

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
					wTurtle.Reset();
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
					wTurtle.Reset();
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
					wTurtle.Reset();
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

function clearEditor(editor) {
	if(confirm("Do you really want to reset the text editor and the 3D render ?")) {
		editor.getSession().setValue(sessionStorage.getItem('genesisCode'));
		document.getElementById('runCode').click();
		unlockButtons();
	}else {

	}
}

function upload() {
	document.getElementById('hiddenButton').click();
}

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

/*function loadExample(editor) {
	
}*/
/*function loadFromURL(editor) {
	document.getElementById("modalLoadButton").setAttribute('data-dismiss', 'modal');
	let inputURL = document.getElementById('fileURL').value;
	if(inputURL.length == 0){
		document.getElementById("modalLoadButton").removeAttribute('data-dismiss', 'modal');
	}else {
		$.ajax({
			url : inputURL,
			crossDomain: true,
			contentType: 'text/html',
			xhrFields: { withCredentials: false },
			headers: {  'Access-Control-Allow-Origin' : '*' , },
			type : 'GET',
			dataType: 'jsonp',
			success: function(data) {
				$('textarea[name=code]').val(data);
			}
		});
		$('textarea[name=code]').load(inputURL);
		console.log($('textarea[name=code]').val());
	}
}*/