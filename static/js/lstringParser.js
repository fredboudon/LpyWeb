/**
 * @file lstringParser.js
 * @author Renan Berruex <renan.berruex@epitech.eu> and Anthony Scriven <scriven.anthony@gmail.com>
 * @version 1.0
 */

/**
 * Class used to parse the LString and fill the array of Module : .result
 */
class LStringParser {
    constructor(lstr) {
        this.lstr = lstr;
        this.result = [];
        this.i = 0;
        this.symbols = {F: ["F", "Frame"], f: ["f"], S: ["SB", "SetHead", "SetScale", "StartGC", "Sphere", "Surface", "Sweep", "SetContour", "SectionResolution", "SetWidth", "SetGuide", "SetColor"],
        E: ["EndGC", "Elasticity", "EB", "EP", "EndGuide"], P: ["PinpointRel", "PglShape", "Pinpoint", "PositionOnGuide", "PP"], I: ["InterpolateColors", "IncWidth", "IncColor"], i: ["iRollL", "iRollR"],
        M: ["MoveTo", "MoveRel", "MultScale"], Q: ["Quad"], B: ["Box", "BP"], L: ["Left", "Label", "LineTo", "LineRel"], U: ["Up"], D: ["Down", "DivScale", "DecWidth", "DecColor"], T: ["Tropism", "TurnAround"],
        R: ["RollL", "RollR", "RollToVert", "Right"], C: ["Circle"], n: ["nF"], others: ["_", "[", "]", "+", "-", "/", "\\", "&", "^", "@M", "@R", "@D", "@Dd", "@Di", "@Gc", "@Ge", "@V", "@g", "@O", "@o",
        "@B", "@b", "@L", "@Ts", "@Tp", "|", ",", "~", ";", "{", "}", "!"]};
    }

	getParsedLString() {
		return this.result;
	}

	/**
     * Parse the LString (this.lstr) and fill the this.result array wich is an array of module.
     */
    ParseLString() {
		this.i = 0;
		var L = this.lstr.length;

		while (this.i < L) {
			if (this.getSizeSymbol(this.lstr, this.i) > 0) {
				name = this.recupName();
				this.i = this.i + name.length;
				if (this.lstr[this.i] == '(') { //If the module have parameters
					this.i++;
					if (name == "Sweep") {
						var sweepParams = this.recupParam(true);
						this.result.push(new Module(name, sweepParams));
					}else {
						this.result.push(new Module(name, this.recupParam()));
					}
				}
				else {//s'il n'en a pas
					this.result.push(new Module(name, []));
					this.i--;
				}
            }
			this.i++;
        }
    }
	
	recupName() {
		var L = this.getSizeSymbol(this.lstr, this.i);
		var name = "";
		for (var j = 0; j < L; j++) {
			name += this.lstr[this.i+j];
		}
		return name;
	}
	
	/**
     * Return an array of number that contain module parameters (the module at the position i in the LString)
     */
	recupParam(sweep = false) {
		//All if(sweep) conditions concern the sweep Module. The parser works without it.
		if(sweep) {
			var path = this.curveToJS();
			var section = this.curveToJS();
			this.i = this.i + 3;
		}

		var tmp = this.i;
		while (this.lstr[this.i] != ')') {
			this.i++;
		}
		var params = this.lstr.substring(tmp, this.i);
		var tab = params.split(","); //Splits the parameters at each ',' into a tab
		var arrayParam = [];
		if(sweep) {
			arrayParam.push(path);
			arrayParam.push(section);
			this.i = this.i - tab[3].length - tab[4].length - tab[5].length - "Vector3".length;
			for(let p = 0; p < 3; p++) {
				tab.pop();
			}
		}
		var k = 0 
		while (k < tab.length) {//The parameter is parsed into a float if it's supposed to be a number. Else it keeps the parameter intact and push it into the returned array.
			if(isNaN(parseFloat(tab[k]))) {
				arrayParam.push(tab[k]);
			}else {
				arrayParam.push(parseFloat(tab[k]));
			}
			k++;
		}
		if(sweep) {
			var width = this.curveToJS();
			arrayParam.push(width);
		}
		console.log(arrayParam);
		return arrayParam;
	}

	/**
     * Transform Python curves in BabylonJS Vector3
     */

	curveToJS() {
		var tmp = this.i;
		var tab = [];

		while (this.lstr[this.i] != '[') {
			tmp++;
			this.i++;
		}
		while (this.lstr[this.i] != ']') {
			this.i++;
		}
		var params = this.lstr.substring(tmp, this.i);
		tab = params.split("(");//je split a chaque parenthèse ouvrante <=> chaque Vector3
		tab.shift();
		for(let i = 0; i<tab.length; i++) {
			tab[i] = tab[i].replace("),Vector3", "");
			tab[i] = tab[i].split(",");
			for(let j = 0; j < 3; j++) {
				tab[i][j] = parseFloat(tab[i][j]);
			}
			tab[i] = new BABYLON.Vector3(tab[i][0], tab[i][1], tab[i][2]);
		}
		this.i ++;

		return tab;
	}

	/**
	 * Permit to discern a module than an other caracter in the LString
	 */

    getSizeSymbol(lstr, i) {
		var size = 0;

		if(lstr[i] in this.symbols) {
			this.symbols[lstr[i]].forEach(function(element) {
				size = searchSymbol(lstr, i, size, element);
			});
		}else {
			this.symbols["others"].forEach(function(element) {
				size = searchSymbol(lstr, i, size, element);
			});
		}
		return size;
	}
}

function searchSymbol(lstr, i, tmp, symbol) {
	for (j = 0; j < symbol.length; j++) {
		if (lstr[i+j] != symbol[j])
			return tmp;
	}
	
	return symbol.length;
}
