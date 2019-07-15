/**
 * @file main.js
 * @author Renan Berruex <renan.berruex@epitech.eu>
 * @version 0.1
 */

function Init(drawTurtle, webTurtle) {
	display(drawTurtle, webTurtle, "");
}

function display(drawTurtle, webTurtle, LString) {

//Stopping the render loop when creating shapes improve CPU's performances.
    drawTurtle.engine.stopRenderLoop();

    if (LString == "Syntax error")
        alert("Syntax error");
    else {
        var lstrParser = new LStringParser();
        //ATTENTION PROBLEME AVEC LES SYMBOLES VIRUGULES (dans le lstring parser)
        lstrParser.lstr = LString;
        lstrParser.ParseLString();
        //console.log(lstrParser.result);
        webTurtle.Start(lstrParser.result);
        //drawTurtle.optimizer.start();
        //console.log(drawTurtle.optimizer.currentFrameRate);
    }

    // Compteur de FPS
    //var fpsDiv = document.getElementById("fpsCounter");

    // Render loop
    drawTurtle.engine.runRenderLoop(function()
    {
        //UpdateFPS();
        drawTurtle.scene.render();
    });

    // Resize event
    window.addEventListener("resize", function()
    {
        drawTurtle.engine.resize();
    });
}