/**
 * @file module.js
 * @author Renan Berruex <renan.berruex@epitech.eu>
 * @version 1.0
 */

/**
 * Class that represent a LString module
 */
 
class Module {
	constructor(name, paramList, nbChild) {
		this.name = name; //objet String, contient le nom du module (ex : I)
		this.paramList = paramList; //objet Array, c'est la liste des paramètres (ex : 1, 1.5)
		this.nbChild = nbChild;
	}
}
