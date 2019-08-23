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
				if (this.lstr[this.i] == '(') { //si mon module a des parametres
					this.i++;
					this.result.push(new Module(name, this.recupParam()));
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
	recupParam() {
		var tmp = this.i;
		while (this.lstr[this.i] != ')') {
			this.i++;
		}
		var params = this.lstr.substring(tmp, this.i);// je recupere tout ce qu'il y a dans les parentheses
		var tab = params.split(",");//je split a chaque virgule
		var arrayParam = [];
		var k = 0 
		while (k < tab.length) {//pour chaque element, je le met en Number et je le push dans mon tableau de parametre
			if(tab[k] == "l") {
				arrayParam.push(tab[k]);
			}else {
				arrayParam.push(parseFloat(tab[k]));
			}
			k++;
		}
		return arrayParam;
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

function searchSymbol(lstr, i, tmp, symbol) {//true if finded
	for (j = 0; j < symbol.length; j++) {
		if (lstr[i+j] != symbol[j])
			return tmp;
	}
	
	return symbol.length;
}
