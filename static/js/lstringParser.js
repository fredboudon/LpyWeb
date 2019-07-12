/**
 * @file lstringParser.js
 * @author Renan Berruex <renan.berruex@epitech.eu>
 * @version 1.0
 */

/**
 * Class used to parse the LString and fill the array of Module : .result
 */
class LStringParser {
    constructor(lstr) {
        this.lstr = lstr;
        this.result = [];
    }

	getParsedLString() {
		return (this.result);
	}

	/**
     * Parse the LString (this.lstr) and fill the this.result array wich is an array of module.
     */
    ParseLString() {
		var i = 0;
		var L = this.lstr.length;

		while (i < L) {
			if (this.getSizeSymbol(this.lstr, i) > 0) {
				name = this.recupName(i);
				i = i + name.length;
				if (this.lstr[i] == '(') { //si mon module a des parametres
					i++;
					this.result.push(new Module(name, this.recupParam(i)));
				}
				else {//s'il n'en a pas
					this.result.push(new Module(name, []));
					i--;
				}
            }
			i++;
        }
    }
	
	recupName(i) {
		var L = this.getSizeSymbol(this.lstr, i);
		var name = "";
		for (var j = 0; j < L; j++) {
			name += this.lstr[i+j];
		}
		return (name);
	}
	
	/**
     * Return an array of number that contain module parameters (the module at the position i in the LString)
     */
	recupParam(i) {
		var tmp = i;
		while (this.lstr[i] != ')') {
			i++;
		}
		var params = this.lstr.substring(tmp, i);// je recupere tout ce qu'il y a dans les parentheses
		var tab = params.split(",");//je split a chaque virgule
		var arrayParam = new Array;
		i = 0;
		while (i < tab.length) {//pour chaque element, je le met en Number et je le push dans mon tableau de parametre
			arrayParam.push(new Number(tab[i]));
			i++;
		}
		return (arrayParam);
	}

	/**
	 * Permit to discern a module than an other caracter in the LString
	 */
    getSizeSymbol(lstr, i) {
		var size = 0;
		
		size = searchSymbol(lstr, i, size, "["); 		size = searchSymbol(lstr, i, size, "SB");
		size = searchSymbol(lstr, i, size, "]"); 		size = searchSymbol(lstr, i, size, "EB");

		size = searchSymbol(lstr, i, size, "Pinpoint");
		size = searchSymbol(lstr, i, size, "PinpointRel");
		size = searchSymbol(lstr, i, size, "@R");	 	size = searchSymbol(lstr, i, size, "SetHead");
		size = searchSymbol(lstr, i, size, "+"); 		size = searchSymbol(lstr, i, size, "Left");
		size = searchSymbol(lstr, i, size, "-"); 		size = searchSymbol(lstr, i, size, "Right");
		size = searchSymbol(lstr, i, size, "^"); 		size = searchSymbol(lstr, i, size, "Up");
		size = searchSymbol(lstr, i, size, "&"); 		size = searchSymbol(lstr, i, size, "Down");
		size = searchSymbol(lstr, i, size, "/");		size = searchSymbol(lstr, i, size, "RollL");
		size = searchSymbol(lstr, i, size, "\\");		size = searchSymbol(lstr, i, size, "RollR");
		size = searchSymbol(lstr, i, size, "iRollL");
		size = searchSymbol(lstr, i, size, "iRollR");
		size = searchSymbol(lstr, i, size, "|");		size = searchSymbol(lstr, i, size, "TurnAround");
		size = searchSymbol(lstr, i, size, "@V");		size = searchSymbol(lstr, i, size, "RollToVert");

		size = searchSymbol(lstr, i, size, "@M");		size = searchSymbol(lstr, i, size, "MoveTo");
		size = searchSymbol(lstr, i, size, "MoveRel");

		size = searchSymbol(lstr, i, size, "@Dd");		size = searchSymbol(lstr, i, size, "DiveScale");
		size = searchSymbol(lstr, i, size, "@Di");		size = searchSymbol(lstr, i, size, "MultScale");
		size = searchSymbol(lstr, i, size, "@D");		size = searchSymbol(lstr, i, size, "SetScale");

		size = searchSymbol(lstr, i, size, "F");
		size = searchSymbol(lstr, i, size, "f");
		size = searchSymbol(lstr, i, size, "nF");
		size = searchSymbol(lstr, i, size, "@Gc");		size = searchSymbol(lstr, i, size, "StartGC");
		size = searchSymbol(lstr, i, size, "@Ge");		size = searchSymbol(lstr, i, size, "EndGC");
		size = searchSymbol(lstr, i, size, "{");		size = searchSymbol(lstr, i, size, "BP");
		size = searchSymbol(lstr, i, size, "}");		size = searchSymbol(lstr, i, size, "EP");
		size = searchSymbol(lstr, i, size, ".");		size = searchSymbol(lstr, i, size, "PP");
		size = searchSymbol(lstr, i, size, "LineTo");
		size = searchSymbol(lstr, i, size, "OLineTo");
		size = searchSymbol(lstr, i, size, "LineRel");
		size = searchSymbol(lstr, i, size, "OLineRel");
		size = searchSymbol(lstr, i, size, "@O");		size = searchSymbol(lstr, i, size, "Sphere");
		size = searchSymbol(lstr, i, size, "@o");		size = searchSymbol(lstr, i, size, "Circle");
		size = searchSymbol(lstr, i, size, "@B");		size = searchSymbol(lstr, i, size, "Box");
		size = searchSymbol(lstr, i, size, "@b");		size = searchSymbol(lstr, i, size, "Quad");
		size = searchSymbol(lstr, i, size, "@L");		size = searchSymbol(lstr, i, size, "Label");
		size = searchSymbol(lstr, i, size, "Surface");
		size = searchSymbol(lstr, i, size, "~");
		size = searchSymbol(lstr, i, size, "~l");
		size = searchSymbol(lstr, i, size, "@g");		size = searchSymbol(lstr, i, size, "PglShape");
		size = searchSymbol(lstr, i, size, "Frame");
		size = searchSymbol(lstr, i, size, "SetContour");
		size = searchSymbol(lstr, i, size, "SectionResolution");
		size = searchSymbol(lstr, i, size, "SetGuide");
		size = searchSymbol(lstr, i, size, "EndGuide");
		size = searchSymbol(lstr, i, size, "Sweep");
		size = searchSymbol(lstr, i, size, "PositionOnGuide");

		size = searchSymbol(lstr, i, size, "_");		size = searchSymbol(lstr, i, size, "IncWidth");
		size = searchSymbol(lstr, i, size, "!");		size = searchSymbol(lstr, i, size, "DecWidth");
		size = searchSymbol(lstr, i, size, "SetWidth");

		size = searchSymbol(lstr, i, size, ";");		size = searchSymbol(lstr, i, size, "IncColor");
		size = searchSymbol(lstr, i, size, ",");		size = searchSymbol(lstr, i, size, "DecColor");
		size = searchSymbol(lstr, i, size, "SetColor");
		size = searchSymbol(lstr, i, size, "InterpolateColors");

		size = searchSymbol(lstr, i, size, "@Ts");		size = searchSymbol(lstr, i, size, "Elasticity");
		size = searchSymbol(lstr, i, size, "@Tp");		size = searchSymbol(lstr, i, size, "Tropism");
		return (size);
    }
}
function searchSymbol(lstr, i, tmp, symbol) {//true if finded
	for (j = 0; j < symbol.length; j++) {
		if (lstr[i+j] != symbol[j])
			return (tmp);
	}
	return (symbol.length);
}
