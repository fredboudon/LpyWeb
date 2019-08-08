/**
 * @file webTurtle.js
 * @author Renan Berruex <renan.berruex@epitech.eu> and Maxime Cauvin <maxime.cauvin@epitech.eu> and Anthony Scriven <scriven.anthony@gmail.com>
 * @version 0.1
 */

const GEOM_EPSILON = 1e-5;
//const GEOM_TOLERANCE = 1e-10;
const GEOM_RAD = 0.01745329052;
const GEOM_PI = Math.PI;

const SHAPE_NOID = -1;

/**
 * Light conversion from the C++ L-Py turtle
 */
class webTurtle {
    /**
     * webTurtle constructor
     * 
     * @param {drawTurtle} drawTurtle An instance of a drawTurtle
     */
    constructor(drawTurtle) {
        this.paramStack = [];
        this.drawTurtle = drawTurtle;
        this.currentParams = {};
        this.defaultStep = 1;
        this.angleIncrement = 60;
        this.widthIncrement = 1;
        this.scaleMultiplier = 0.5;
		this.radius = 0.1;
        this.id = SHAPE_NOID;
        this.parentId = SHAPE_NOID;
		this.dynamicmode = true;
		this.currentParams = {
            position: new BABYLON.Vector3(0,0,0),
            heading: new BABYLON.Vector3(0,1,0),
            left: new BABYLON.Vector3(-1,0,0),
            up: new BABYLON.Vector3(0,0,1),
            scale: new BABYLON.Vector3(1,1,1),
            reflection: new BABYLON.Vector3(1,1,1),
            lastId: SHAPE_NOID,
            width: 0.1,
            tropism: new BABYLON.Vector3(0,1,0),
            elasticity: 0.,
			angle: 30,
            screenCoordinates: false,
            polygon: false,
            generalizedCylinder: false,
            pointList: [],
            shapeSection: [],
            colorIndex: 1,
			customId: SHAPE_NOID,
            customParentId: SHAPE_NOID
        };
    }

	lstringInterpret(modules, i){
		switch (modules[i].name) {
			case '[':
				this.Push();
				break;

			case ']':
				this.Pop();
				break;

			case 'F':
				this.F(modules[i].paramList[0], modules[i].paramList[1], this.drawTurtle.materialColors[this.currentParams.colorIndex], "cylinder");
				break;

			case 'f':
				this.f(modules[i].paramList[0]);
				break;

            case 'nF':
                this.nF(modules[i].paramList[0], modules[i].paramList[1], modules[i].paramList[2], this.drawTurtle.materialColors[this.currentParams.colorIndex], "longCylinder")

			case 'X':
				break;

			case '%':
				break;

			case '*':
				break;

			case '?P':
				break;

			case '?H':
				break;

			case '?U':
				break;

			case '?L':
				break;

			case '?R':
				break;

			case '@Gc':
				break;

			case '@Ge':
				break;

			case '{':
				break;

			case '}':
				break;

			case '@M':
				this.move(modules[i].paramList[0])
				break;

			case '@R':
				this.setHead(modules[i].paramList[0], modules[i].paramList[1])
				break;

			case '+':
				this.left(modules[i].paramList[0]);
				break;

			case '-':
				this.right(modules[i].paramList[0]);
				break;

			case '^':
				this.up(modules[i].paramList[0]);
				break;

			case '&':
				this.down(modules[i].paramList[0]);
				break;

			case '/':
				this.rollL(modules[i].paramList[0]);
				break;

			case '\\':
				this.rollR(modules[i].paramList[0]);
				break;

			case '|':
				this.turnAround();
				break;

			case '@V':
				break;

			case '@O':
                this.sphere(modules[i].paramList[0], this.drawTurtle.materialColors[this.currentParams.colorIndex], "sphere");
				break;

			case '@o':
                this.disc(modules[i].paramList[0], this.drawTurtle.materialColors[this.currentParams.colorIndex], "disc");
				break;

            case '@B':
                this.box(modules[i].paramList[0], modules[i].paramList[1], this.drawTurtle.materialColors[this.currentParams.colorIndex], "box");
                break;

            case '@b':
                this.plane(modules[i].paramList[0], modules[i].paramList[1], this.drawTurtle.materialColors[this.currentParams.colorIndex], "plane");
                break;

			case '@L':
                //this.label(modules[i].paramList[0], modules[i].paramList[1], this.drawTurtle.materialColors[0], "label")
				break;

			case '_':
this.underscore(modules[i].paramList[0]);
				break;

			case '!':
this.underscore(modules[i].paramList[0]);
				break;

			case 'SetWidth':
this.underscore(modules[i].paramList[0]);
				break;

			case ';':
				this.incColor(modules[i].paramList[0]);
				break;

			case ',':
				this.decColor(modules[i].paramList[0]);
				break;

			case 'SetColor':
				this.setColor(modules[i].paramList[0]);
				break;

            /*case 'InterpolateColors':
                this.interpolateColors(modules[i].paramList[0], modules[i].paramList[1], modules[i].paramList[2]);
                break; */

			case '@Dd':
				break;

			case '@Di':
				break;

			case '@D':
				break;

			case 'surface':
				break;

			case '~':
				break;

			case '@g':
				break;

            case 'Frame':
                this.Frame(modules[i].paramList[0]);
                break;

            /*case 'LineTo':
                this.lineTo(modules[i].paramList[0], modules[i].paramList[0]);
                break;*/
		}
	}
	
    /**
     * Starting the turtle
     */
    Start(modules) {
		for (var i in modules) {
			this.lstringInterpret(modules, parseInt(i));
		}
    }

    /**
     * Transforming turtle axes with a matrix transformation
     *
     * @param {BABYLON.Matrix} matrix The matrix transformation
     */
    Transform(matrix) {
        this.currentParams.heading = new BABYLON.Vector3.TransformCoordinates(this.currentParams.heading, matrix);
        this.currentParams.up = new BABYLON.Vector3.TransformCoordinates(this.currentParams.up, matrix);
        this.currentParams.left = new BABYLON.Vector3.TransformCoordinates(this.currentParams.left, matrix);
    }

    /**
     * Logging out turtle positions and direction axes
     */
    ToString() {
        console.log("Turtle : " + this.currentParams.position.ToString() + ", " +
                    this.currentParams.heading + ", " + this.currentParams.left + ", " +
                    this.currentParams.up);
    }

    /**
     * Resetting the turtle
     */
    Reset(drawTurtle) {
        this.Stop();
        this.paramStack = [];
        this.drawTurtle = drawTurtle;
        this.currentParams = {};
        this.defaultStep = 1;
        this.angleIncrement = 60;
        this.widthIncrement = 1;
        this.scaleMultiplier = 0.5;
        this.radius = 0.1;
        this.id = SHAPE_NOID;
        this.parentId = SHAPE_NOID;
        this.dynamicmode = true;
        this.currentParams = {
            position: new BABYLON.Vector3(0,0,0),
            heading: new BABYLON.Vector3(0,1,0),
            left: new BABYLON.Vector3(-1,0,0),
            up: new BABYLON.Vector3(0,0,1),
            scale: new BABYLON.Vector3(1,1,1),
            reflection: new BABYLON.Vector3(1,1,1),
            lastId: SHAPE_NOID,
            width: 0.1,
            tropism: this.currentParams.tropism,
            elasticity: this.currentParams.elasticity,
			angle: this.currentParams.angle,
            screenCoordinates: false,
            polygon: false,
            generalizedCylinder: false,
            pointList: [],
            shapeSection: [],
            colorIndex: 1,
            customId: SHAPE_NOID,
            customParentId: SHAPE_NOID
        };
	    // if (!this.currentParams.crossSection) {
        //     setDefaultCrossSection();
        // }
        this.ResetShapeSection(64);
        // this.pathInfos = {};
    }

    /**
     * Resetting the shape section used for generalized cylinders
     *
     * @param {Number} circleResolution The resolution for the disc
     */
    ResetShapeSection(circleResolution) {
        this.currentParams.shapeSection = [];
        for (var i = 0; i <= 360; i += (360 / circleResolution)) {
            this.currentParams.shapeSection.push(new BABYLON.Vector3(0.075 * Math.cos((Math.PI * i) / 180), 0.075 * Math.sin((Math.PI * i) / 180), 0));
        }
    }

    /**
     * Dumping turtle current parameters
     */
    Dump() {
        console.log("Turtle params:", this.currentParams);
    }

    /**
     * Stopping the turtle
     */
    Stop() {
        if (this.currentParams.generalizedCylinder && this.currentParams.pointList.length > 1) {
            this.drawTurtle.CreateExtrudeShape("tube" + (this.drawTurtle.graphicElems.length + 1).toString(), { shape: this.currentParams.shapeSection, path: this.currentParams.pointList, sideOrientation: BABYLON.Mesh.DOUBLESIDE, radius: 0.075 }, this.drawTurtle.materialTextures[0]);
        }
        this.pointList = [];
    }
    
    // inline bool emptyStack() const
    /**
     * Clear the stack of turtle parameters
     */
    EmptyStack() {
        this.paramStack = [];
    }

    // virtual void push();
    /**
     * Save into a stack and reset the current turtle parameters
     */
    Push() {
        this.currentParams.lastId = this.parentId;
        this.paramStack.push(Object.assign({}, this.currentParams));
        this.currentParams.pointList = [];
    }

    // virtual void pop();
    /**
     * Recover the old turtle parameters
     */
    Pop() {
        //Currently using texture, the last parameter to the "Create.." function for standard color is: this.drawTurtle.materialColors[this.currentParams.colorIndex]
        if (this.currentParams.generalizedCylinder && this.currentParams.pointList.length > 1) {
            this.drawTurtle.CreateExtrudeShape("tube" + (this.drawTurtle.graphicElems.length + 1).toString(), { shape: this.currentParams.shapeSection, path: this.currentParams.pointList, sideOrientation: BABYLON.Mesh.DOUBLESIDE, radius: 0.075 }, this.drawTurtle.materialTextures[0]);
        }
        if (this.paramStack.length > 0) {
            this.currentParams = this.paramStack.splice(this.paramStack.length - 1, 1)[0];
            this.parentId = this.currentParams.lastId;
        } else {
            console.error("Empty turtle stack: Cannot pop");
        }
    }

    // void incId(uint_t i = 1);
    /**
     * Increment the current turtle id
     *
     * @param {Number} i The identifier
     */
    IncId(i = 1) {
        if (this.id + i < 0) {
            console.error("Id should be a valid positive value.");
        } else {
            this.id += i;
        }
    }

    // void decId(uint_t i = 1);
    /**
     * Decrement the current turtle id
     *
     * @param {Number} i The identifier
     */
    DecId(i = 1) {
        if (this.id >= i) {
            console.error("Id should be a valid positive value.");
        } else {
            this.id -= i;
        }
    }

    // inline void f() { f(default_step); }heading
    // virtual void f(real_t length);
    /**
     * Move the turtle forward without drawing anything
     *
     * @param {Number} length The distance movement
     */
    f(length = this.defaultStep) {
        // if (length > 0 && this.currentParams.guide) { // Not implemented yet
        //     this.applyGuide();
        // }

        if (this.currentParams.elasticity > GEOM_EPSILON) {
            this.applyTropism();
        }
        this.currentParams.position = this.currentParams.position.add(this.currentParams.heading.scale(length * this.currentParams.scale.z));
		// if (length > 0 && this.currentParams.guide) { // Not implemented yet
        //    this.adjustToGuide();
        //}
    }

    // inline void F() { F(default_step,-1); }
    // inline void F(real_t length) { F(length,-1); }
    // virtual void F(real_t length, real_t topradius);
    /**
     * Move the turtle forward and drawing a cylinder of that distance
     *
     * @param {Number} length The distance movement and length of the cylinder
     * @param {Number} topRadius The radius on the top of the cylinder
     * @param {Number} color The color of the cylinder
     * @param {Number} budId The id of the cylinder mesh
     */
    F(length = this.defaultStep, topRadius = this.radius, materialColor, id) {
        if (length > 0) {
            if (this.currentParams.elasticity > GEOM_EPSILON) {
                this.applyTropism();
            }
            if (length > GEOM_EPSILON) {
                if (!this.currentParams.generalizedCylinder) {
                    this.drawTurtle.CreateCylinder(id, { diameterBottom: this.radius, diameterTop: topRadius, height: length }, this.currentParams, materialColor);
                } else {
                    this.currentParams.pointList.push(this.currentParams.position.clone());
                }
                this.currentParams.position = this.currentParams.position.add(this.currentParams.heading.scale(length * this.currentParams.scale.z));
                if (this.currentParams.generalizedCylinder) {
                    this.currentParams.pointList.push(this.currentParams.position.clone());
                }
            }
            if (topRadius > -GEOM_EPSILON) {
                this.currentParams.width = topRadius;
            }
        }
        else if (length < -GEOM_EPSILON) {
            this.turnAround();
            this.F(-length, topRadius);
            this.turnAround();
        }
    }

    Frame(length = this.defaultStep) {
        if (length > GEOM_EPSILON) {
            this.drawTurtle.CreateFrame({ diameter: this.radius, height: length}, this.currentParams);
        }
    }

    /**
    * Draw a sphere of a given radius
    *
    * @param {Number} radius  The radius of the sphere.
    * @param {Number} color The color of the sphere.
    * @param {Number} id The id of the sphere mesh.
    *
    */
    sphere(radius = this.radius, materialColor, id) {
        if (radius > 0) {
            this.drawTurtle.CreateSphere(id, { diameter: radius }, this.currentParams, materialColor);
        }
    }

    /**
    * Draw a disc of a given radius
    *
    * @param {Number} radius  The radius of the disc.
    * @param {Number} color The color of the disc.
    * @param {Number} id The id of the disc mesh.
    *
    */
    disc(radius = this.radius, materialColor, id) {
        if (radius > 0) {
            this.drawTurtle.CreateDisc(id, { radius: radius, sideOrientation: BABYLON.Mesh.DOUBLESIDE }, this.currentParams, materialColor);
        }
    }

    // void quad(real_t length, real_t topradius);
    // inline void quad(real_t length) { quad(length,getWidth());}
    // inline void quad() { quad(default_step,getWidth());}
    /**
     * Draw a box of a given length
     *
     * @param {Number} length The distance movement and length of the box
     * @param {Number} topRadius The radius on the top of the box
     * @param {Number} color The color of the box
     * @param {Number} id The id of the box mesh
     */
    box(length = this.defaultStep, topRadius = this.radius, materialColor, id) {
        if (length > 0) {
            this.drawTurtle.CreateBox(id, {height: length, width: topRadius, depth: topRadius}, this.currentParams, materialColor);

            if (topRadius > -GEOM_EPSILON) {
                this.currentParams.width = topRadius;
            }
            this.currentParams.position = this.currentParams.position.add(this.currentParams.heading.scale(length * this.currentParams.scale.z));
        }
    }

    /**
     * Draw a plane of a given length
     *
     * @param {Number} length The distance movement and length of the plane
     * @param {Number} topRadius The radius on the top of the plane
     * @param {Number} color The color of the plane
     * @param {Number} id The id of the plane mesh
     */
    plane(length = this.defaultStep, topRadius = this.radius, materialColor, id,) {
        if (length > 0) {
            this.drawTurtle.CreatePlane(id, {height: length, width: topRadius, sideOrientation: BABYLON.Mesh.DOUBLESIDE}, this.currentParams, materialColor);

            if (topRadius > -GEOM_EPSILON) {
                this.currentParams.width = topRadius;
            }
            this.currentParams.position = this.currentParams.position.add(this.currentParams.heading.scale(length * this.currentParams.scale.z));
        }
    }

    // void nF(real_t length, real_t dl);
    // void nF(real_t length, real_t dl, real_t radius, const QuantisedFunctionPtr radiusvariation = NULL);
    /**
     * Move the turtle forward by bursts and drawing multiple cylinders of the total distance
     *
     * @param {Number} length	     The distance movement and total length of all cylinders
     * @param {Number} nbSteps	     The number of cylinders to compose the big one.
     * @param {Number} radius	     The radius on the top of the cylinder
     * @param {Number} materialColor The color of the cylinder
     * @param {Number} id		     The id of the cylinder
     */
    nF(length = this.defaultStep, nbSteps, endRadius = 0.1, materialColor, id) {
		var dl = length / nbSteps;
		var radiusEvolution = (this.radius - endRadius) / nbSteps;

        for (var i = 0; i < nbSteps; ++i) {
            this.F(dl, this.radius - radiusEvolution, materialColor, id);
			this.underscore(this.radius - radiusEvolution);
        }
		//var deltaStep = length - nbSteps * dl;
		/*if (deltaStep > GEOM_EPSILON) {
            this.F(deltaStep, endRadius, id);
        }*/
    }
	
    /**
     * Move the turtle forward and drawing a prefab of that distance
     *
     * @param {Number} length The distance movement and length of the cylinder
     * @param {Number} topRadius The radius on the top of the cylinder
     */
    P(moduleName, textureName, length, topRadius) {
        if (length > 0) {
            if (this.currentParams.elasticity > GEOM_EPSILON) {
                this.applyTropism();
            }
            if (length > GEOM_EPSILON) {
				_prefabCallback(this, this.drawTurtle.originalTrunkPrefab, moduleName, textureName, topRadius, this.radius, length, this.currentParams.position, BABYLON.Vector3.RotationFromAxis(this.currentParams.up, this.currentParams.heading, this.currentParams.left), this.drawTurtle.scene);
                this.currentParams.position = this.currentParams.position.add(this.currentParams.heading.scale(length * this.currentParams.scale.z));
            }
            if (topRadius > -GEOM_EPSILON) {
                this.currentParams.width = topRadius;
            }
        }
        else if (length < -GEOM_EPSILON) {
            this.turnAround();
            this.P(-length, topRadius);
            this.turnAround();
        }
    }

    /**
     * Move the turtle forward by bursts and drawing multiple prefabs of the total distance
     *
     * @param {Number} length	The distance movement and total length of all cylinders
     * @param {Number} nbSteps	The number of cylinders to compose the big one.
     * @param {Number} radius	The radius on the top of the cylinder
     */
    nP(moduleName, textureName, length, nbSteps, endRadius) {
		var dl = length / nbSteps;
		var radiusEvolution = (this.radius - endRadius) / nbSteps;

        for (var i = 0; i < nbSteps; ++i) {
            this.P(moduleName, textureName, dl, this.radius - radiusEvolution);
			this.underscore(this.radius - radiusEvolution);
        }
		//var deltaStep = length - nbSteps * dl;
		/*if (deltaStep > GEOM_EPSILON) {
            this.F(deltaStep, endRadius, id);
        }*/
    }
	
    /**
     * Draw a bud in the current direction
     *
     * @param {String} treeID		The id of the tree
     * @param {String} currentId	The id of the module
     * @param {Number} semiRadius	Half of the endRadius of the carrier internode
     */
	affBud(treeId, currentId, name, file, rTop, rBot, L, distance) {
		this.shiftTranslation({x: 0, y: 0, z: distance});
		if ((name == "apical fruit" || name == "axillary fruit") && this.currentParams.fruitsNeedGravity == 1) {
			this.Push(); this.currentParams.heading = new BABYLON.Vector3(0,-1,0); this.currentParams.left = new BABYLON.Vector3(1,0,0);}
		_prefabCallback(this,
			this.drawTurtle.originalBudPrefab,
			[treeId, currentId, name],
			file,
			rTop,
			rBot,
			L,
			this.currentParams.position,
			BABYLON.Vector3.RotationFromAxis(this.currentParams.up, this.currentParams.heading, this.currentParams.left),
			this.drawTurtle.scene);
		if ((name == "apical fruit" || name == "axillary fruit") && this.currentParams.fruitsNeedGravity == 1)
			this.Pop();	
		this.shiftTranslation({x: 0, y: 0, z: -distance});	
	}

    /**
     * Return the number of I downstream
     *
     * @param {Obj}	modules		The list of all tree modules (obtained after LString)
     * @param {Number} pos		The position of the current I father
     */
	getChildrenDownstreamNb(modules, pos) {
		var i = pos+1;
		var bracketManager = 0;
		var res = 0;
		while (i < modules.length) {
			if (modules[i].name == "[")
				bracketManager += 1;
			else if (modules[i].name == "]")
				bracketManager += -1;
			if (bracketManager < 0)
				return (res);
			if (modules[i].name == "I")
				res++;
			i += 1;
		}
		return (res);
	}
	
    /**
     * Manage the draw of a leaf
     */
	affLeaf(treeId, currentId, semiRadius) {
	this.shiftTranslation({x: 0, y: 0, z: semiRadius + this.currentParams.leafPos});
		_prefabCallback(this,
			this.drawTurtle.originalLeafPrefab,
			[treeId, currentId, "leaf"],
			this.drawTurtle.seedBox[this.drawTurtle.seedIndex].leafFile,
			this.currentParams.leafSize,
			this.currentParams.leafSize,
			this.currentParams.leafSize,
			this.currentParams.position,
			BABYLON.Vector3.RotationFromAxis(this.currentParams.up, this.currentParams.heading, this.currentParams.left),
			this.drawTurtle.scene);
	this.shiftTranslation({x: -0, y: 0, z: -(semiRadius +this.currentParams.leafPos)});
	}
	
	//Set the radius of the Turtle
	underscore(radius = 0.1) {
		this.radius = radius;
	}
    
    // inline void left()
    // virtual void left(real_t angle);
    /**
     * Make the turtle turn to the left
     *
     * @param {Number} angle The turning angle
     */
    left(angle = this.angleIncrement) {
        this.right(-angle);
    }

    // inline void right()
    // virtual void right(real_t angle)
    /**
     * Make the turtle turn to the right
     *
     * @param {Number} angle The turning angle
     */
    right(angle = this.angleIncrement) {
        var ra = (angle * (GEOM_PI/180));
        var matrix = new BABYLON.Matrix.RotationAxis(this.currentParams.up, ra);
        this.currentParams.heading = new BABYLON.Vector3.TransformCoordinates(this.currentParams.heading, matrix);
        this.currentParams.left = new BABYLON.Vector3.TransformCoordinates(this.currentParams.left, matrix);
    }
    
    // inline void down()
    // virtual void down(real_t angle);
    /**
     * Make the turtle pitch to the down
     *
     * @param {Number} angle The turning angle
     */
    down(angle = this.angleIncrement) {
        var ra = angle * (GEOM_PI/180.);
        var matrix = new BABYLON.Matrix.RotationAxis(this.currentParams.left, ra);
        this.currentParams.heading = new BABYLON.Vector3.TransformCoordinates(this.currentParams.heading, matrix);
        this.currentParams.up = new BABYLON.Vector3.TransformCoordinates(this.currentParams.up, matrix);
    }

    // inline void up()
    // virtual void up(real_t angle)
    /**
     * Make the turtle pitch to the up
     *
     * @param {Number} angle The turning angle
     */
    up(angle = this.angleIncrement) {
        this.down(-angle);
    }
    
	// inline void rollL()
    // virtual void rollL(real_t angle);
    /**
     * Make the turtle roll to the left

     * @param {Number} angle The turning angle
     */
    rollR(angle = this.angleIncrement) {
        var ra = angle * (GEOM_PI/180.);
        var matrix = new BABYLON.Matrix.RotationAxis(this.currentParams.heading, ra);
        this.currentParams.up = new BABYLON.Vector3.TransformCoordinates(this.currentParams.up, matrix);
        this.currentParams.left = new BABYLON.Vector3.TransformCoordinates(this.currentParams.left, matrix);
    }
    
    // inline void rollR()
    // virtual void rollR(real_t angle)
    /**
     * Make the turtle roll to the right

     * @param {Number} angle The turning angle
     */
    rollL(angle = this.angleIncrement) {
        this.rollR(-angle);
    }

    // virtual void iRollL(real_t angle);
    // inline void iRollL()
    /**
     * [WIP] Make the turtle roll to the left intrinsically
     *
     * @param {Number} angle The turning angle
     */
    iRollR(angle = this.angleIncrement) {
        //TODO

        this.rollR(angle);
        //if (__params ->guide && !__params ->guide ->is2D()) { // Not implemented yet
        //    Turtle3DPath * guide = (Turtle3DPath *)__params->guide.get();
        //    Matrix3 m2 = Matrix3::axisRotation(guide ->__lastHeading, ra);
        //    guide ->__lastUp   = m2 * guide ->__lastUp;
        //    guide ->__lastLeft = m2 * guide ->__lastLeft;
        //}
        //else warning("No appropriate turtle embedding (Guide) specified for intrinsic roll.");
    }

	// virtual void iRollR(real_t angle)
    // inline void iRollR()
    /**
     * Make the turtle roll to the right intrinsically
     *
     * @param {Number} angle The turning angle
     */
    iRollR(angle = this.angleIncrement) {
        this.iRollR(-angle);
    }

	// inline void turnAround()
    /**
     * Make the turtle turn around 180 degrees
     */
    turnAround() {
        this.left(180);
    }

    // virtual void rollToVert(real_t alpha = 1.0, const TOOLS(Vector3)& top = TOOLS(Vector3::OZ));
    /**
     * [WIP] Roll the turtle around the H axis so that H and U lie in a common vertical plane with U closest to up
     *
     * @param {Number} alpha The alpha for the rotation
     * @param {BABYLON.Vector3} top The top axis
     */
    rollToVert(alpha = 1.0, top = new BABYLON.Vector3.Zero()) {
        //TODO
        if (alpha <= 0.0) {
            return;
        }
        if (alpha >= 1.0) {
            //this.currentParams.left = cross(top, this.currentParams.heading);
         //   if (norm(this.currentParams.left) < GEOM_EPSILON)
         //       this.currentParams.left = new BABYLON.Vector3(0, -1, 0);
    	    //else
         //       this.currentParams.left.normalize();
         //   this.currentParams.up = cross(this.currentParams.heading, this.currentParams.left);
        } else {
            var nleft = new BABYLON.Vector3.Cross(top, this.currentParams.heading);
            nleft = nleft.normalize();
            //var rotangle = angle(this.currentParams.left, nleft, this.currentParams.heading);
            rollR(rotangle * alpha * GEOM_DEG);
        }
    }
    
    // virtual void rollToHorizontal(real_t alpha = 1.0, const TOOLS(Vector3)& top = TOOLS(Vector3::OZ)) ;
    /**
     * [WIP] Roll the turtle around the H axis so that H and U lie in a common vertical plane with U closest to up
     *
     * @param {Number} alpha The alpha for the rotation
     * @param {BABYLON.Vector3} top The top axis
     */
    rollToHorizontal(alpha = 1.0, top = new BABYLON.Vector3.Zero()) {
        //TODO

        if (alpha <= 0.0) {
            return;
        }
        if (alpha >= 1.0) {
            alpha = 1.0;
        }
        var nonHorizontal = new BABYLON.Vector3.Dot(this.currentParams.heading, top);
        //if (fabs(nonHorizontal) > GEOM_EPSILON) {
            //var targetHeading = this.currentParams.heading - nonHorizontal * top;
            //if (norm(targetHeading) < GEOM_EPSILON) {
            //    targetHeading = new BABYLON.Vector3(1, 0, 0);
            //} else {
            //    targetHeading.normalize();
            //}
            //var rotAxis = cross(this.currentParams.heading, targetHeading);
            //rotAxis.normalize();
            //var rotAngle = angle(this.currentParams.heading, targetHeading, rotAxis);
            //var matrix = new BABYLON.Matrix.RotationAxis(rotAxis, rotAngle * alpha);
            //transform(matrix);
        //}
    }
    
    // virtual void setHead(const TOOLS(Vector3)& h, const TOOLS(Vector3)& u = TOOLS(Vector3::OX));
    // inline void setHead(real_t hx = 0, real_t hy = 0, real_t hz = 1, 
	// 					  real_t ux = 1, real_t uy = 0, real_t uz = 0)
    /**
     * [WIP] Set the turtle Heading and Up vector
     *
     * @param {BABYLON.Vector3} head The head vector
     * @param {BABYLON.Vector3} up The up vector
     */
    setHead(head, up) {
        //TODO

        var h = head;
        var lh = h.length();
        h = h.normalize();

        var u = up;
        var lu = u.length();
        u = u.normalize();
        if (lh < GEOM_EPSILON) {
            console.error("Heading vector in setHead is NULL");
            return;
        }
        if (lu < GEOM_EPSILON) {
            console.error("Up vector in setHead is NULL");
            return;
        }
        var l = new BABYLON.Vector3.Cross(u, h);
        //if (norm(l) < GEOM_EPSILON) {
        //    console.error("Heading and Up vector in setHead are colinear.");
        //    return;
        //}

        //if (!h.isOrthogonalTo(u)) {
        //    u = cross(h, l);
        //    console.warning("Re-orthogonalizing Up vector in setHead");
        //}
        this.currentParams.heading = h;
        this.currentParams.up = u;
        this.currentParams.left = l;
    }

    // virtual void eulerAngles(real_t azimuth = 180, real_t elevation = 90, real_t roll = 0);
    /**
     * Calculate new turtle axes with a rotation matrix and given parameters
     *
     * @param {Number} azimuth The azimuth angle
     * @param {Number} elevation The elevation
     * @param {Number} roll The roll
     */
    eulerAngles(azimuth = 180, elevation = 90, roll = 0) {
        var matrix = new BABYLON.Matrix.RotationYawPitchRoll(new BABYLON.Vector3(azimuth * GEOM_RAD, - elevation * GEOM_RAD, roll * GEOM_RAD));

        this.currentParams.heading = new BABYLON.Vector3.TransformCoordinates(matrix, new BABYLON.Vector3(1, 0, 0));
        this.currentParams.up = m * new BABYLON.Vector3.TransformCoordinates(matrix, new BABYLON.Vector3(0, 0, 1));
        this.currentParams.left = new BABYLON.Vector3.Cross(this.currentParams.up, this.currentParams.heading);
    }
    
    // virtual void move(const TOOLS(Vector3)& pos);
    // inline void move(real_t x = 0, real_t y = 0, real_t z = 0)
    /**
     * Move the turtle to the given position
     *
     * @param {BABYLON.Vector3} pos The new position
     */
    move(pos) {
        if (this.currentParams.screenCoordinates) {
            this.currentParams.position = new BABYLON.Vector3(pos.z(), pos.x(), pos.y());
        } else {
            this.currentParams.position = pos;
        }
    }
    
    // virtual void shift(const TOOLS(Vector3) & pos);
    // inline void shift(real_t x = 0, real_t y = 0, real_t z = 0)
    /**
     * Move the turtle by adding a position into the current one
     *
     * @param {BABYLON.Vector3} pos The adding position
     */
    shift(pos) {
        if (this.currentParams.screenCoordinates) {
            this.currentParams.position = this.currentParams.position.add(new BABYLON.Vector3(pos.z(), pos.x(), pos.y()));
        } else {
            this.currentParams.position = this.currentParams.position.add(pos);
        }
    }
	
	//pour translater la tortue par rapport à elle-même
	//trans= {x: déplacmnt crabe (gauche/droite), y: déplacmnt ascenseur (haut/bas), z: déplacmnt train (avant/arriere)}
	shiftTranslation(trans) {
		var hx = this.currentParams.heading.x;
		var hy = this.currentParams.heading.y;
		var hz = this.currentParams.heading.z;
		var lx = this.currentParams.left.x;
		var ly = this.currentParams.left.y;
		var lz = this.currentParams.left.z;
		var ux = this.currentParams.up.x;
		var uy = this.currentParams.up.y;
		var uz = this.currentParams.up.z;
		
		var resX = (hx * trans.z) + (lx * trans.x * (-1)) + (ux * trans.y);
		var resY = (hy * trans.z) + (ly * trans.x * (-1)) + (uy * trans.y);
		var resZ = (hz * trans.z) + (lz * trans.x * (-1)) + (uz * trans.y);
		this.shift({x: resX, y: resY, z: resZ});
	}

    // void _tendTo(const TOOLS(Vector3)& t, real_t strength = 1.0);
    /**
     * Make the turtle tend to an axis of a given strength (used for tropism)
     *
     * @param {BABYLON.Vector3} t The tending axis
     * @param {Number} strength The strength between 0 and 1
     */
    tendTo(t, strength = 1.0) {
        var h = this.currentParams.heading;
        var cp = BABYLON.Vector3.Cross(h, t);
        var sinus = cp.length();
        if (sinus > GEOM_EPSILON) {
            cp.scaleInPlace(1 / sinus);
            var cosinus = BABYLON.Vector3.Dot(h, t);
            var ang = Math.atan2(sinus, cosinus);
            var m = BABYLON.Matrix.RotationAxis(cp, ang * strength);
            //console.log(m)
            this.Transform(m);
        } else {
            var cosinus = BABYLON.Vector3.Dot(h, t);
            if (cosinus < GEOM_EPSILON) {
                var ang = GEOM_PI;
                this.Transform(new BABYLON.Matrix.RotationAxis(this.currentParams.up, ang * strength));
            }
        }
    }

    // void oLineTo(const TOOLS(Vector3)& v, real_t topradius = -1.0);
    // inline void oLineTo(real_t x = 0, real_t y = 0, real_t z = 0, real_t topradius = -1.0)
    /**
     * Trace line toward the vector given and change the orientation
     *
     * @param {BABYLON.Vector3} v A vector
     * @param {Number} topRadius The top radius
     */
    oLineTo(v, topRadius = -1.0) {
        var h = v.subtract(getPosition());
        var l = h.length();
        l = l.normalize();
        if (l > GEOM_EPSILON) {
            this.tendTo(h);
            this.F(l, topradius);
        }
    }

    // virtual void oLineRel(const TOOLS(Vector3)& v, real_t topradius = -1.0);
    // inline void oLineRel(real_t x = 0, real_t y = 0, real_t z = 0, real_t topradius = -1.0)
    /**
     * Trace line toward the position + the vector given and change the orientation
     *
     * @param {BABYLON.Vector3} v A vector
     * @param {Number} topRadius The top radius
     */
    oLineRel(v, topRadius = -1.0) {
        var h = (this.currentParams.screenCoordinates) ? (new BABYLON.Vector3(v.z, v.x, v.y)) : (v.clone());
        var l = h.length();
        l = l.normalize();
        if (l > GEOM_EPSILON) {
            this.tendTo(h);
            this.F(l, topradius);
        }
    }

    // virtual void lineTo(const TOOLS(Vector3) & v, real_t topradius = -1.0);
	// inline void lineTo(real_t x = 0, real_t y = 0, real_t z = 0, real_t topradius = -1.0)
    /**
     * Trace line to the vector given without changing the orientation.
     *
     * @param {BABYLON.Vector3} v A vector
     * @param {Number} topRadius The top radius
     */
    lineTo(v, topRadius = -1.0) {
        var heading = this.currentParams.heading;
        var left = this.currentParams.left;
        var up = this.currentParams.up;

        this.oLineTo(v, topRadius);

        this.currentParams.heading = heading;
        this.currentParams.left = left;
        this.currentParams.up = up;
    }

    // virtual void lineRel(const TOOLS(Vector3) & v, real_t topradius = -1.0);
	// inline void lineRel(real_t x = 0, real_t y = 0, real_t z = 0, real_t topradius = -1.0)
    /**
     * Trace line to the position + the vector given without changing the orientation.
     *
     * @param {BABYLON.Vector3} v A vector
     * @param {Number} topRadius The top radius
     */
    lineRel(v, topRadius = -1.0) {
        var heading = this.currentParams.heading;
        var left = this.currentParams.left;
        var up = this.currentParams.up;

        this.oLineRel(v, topRadius);

        this.currentParams.heading = heading;
        this.currentParams.left = left;
        this.currentParams.up = up;
    }

    // void pinpoint(const TOOLS(Vector3) & v);
	// inline void pinpoint(real_t x = 0, real_t y = 0, real_t z = 0)
    /**
     * Orient turtle toward with the vector given
     *
     * @param {BABYLON.Vector3} v A vector
     */
    pinpoint(v) {
        var h = (this.currentParams.screenCoordinates) ? (new BABYLON.Vector3(v.z, v.x, v.y)) : (v.clone());
        h = h.subtract(this.currentParams.position);
        var l = h.length();
        l = l.normalize();
        if (l > GEOM_EPSILON) {
            this.tendTo(h);
        }
    }

    // virtual void pinpointRel(const TOOLS(Vector3) & v);
	// inline void pinpointRel(real_t x = 0, real_t y = 0, real_t z = 0)
    /**
     * Orient turtle toward to the position + the vector given
     *
     * @param {BABYLON.Vector3} v A vector
     */
    pinpointRel(v) {
        var h = (this.currentParams.screenCoordinates) ? (new BABYLON.Vector3(v.z, v.x, v.y)) : (v.clone());
        var l = h.length();
        l = l.normalize();
        if (l > GEOM_EPSILON) {
            this.tendTo(h);
        }
    }

    // virtual void setColor(int val);
    /**
     * Set the index for material colors
     *
     * @param {Number} colorIdx The new color index
     */
    setColor(colorIdx) {
        if (colorIdx >= this.drawTurtle.materialColors.length) {
            console.log("The color '" + colorIdx.toString() + "' hasn't been configured, this attempt will be ignored..");
        } else {
            this.currentParams.colorIndex = colorIdx;
        }
    }

    // inline void incColor()
	// { setColor( getColor() + color_increment ); }
    /**
     * Increment the index for material colors
     *
     * @param {Number} colorInc The color index
     */
    incColor(colorInc) {
        if (colorInc === undefined) {
            if (this.currentParams.colorIndex + 1 < this.drawTurtle.materialColors.length) {
                this.currentParams.colorIndex += 1;
            } else {
                console.log("The color '" + (this.currentParams.colorIndex + 1).toString() + "' hasn't been configured, this attempt will be ignored..");
            }
        } else {
            this.setColor(colorInc);
        }
    }
    
    // inline void decColor()
    // {  setColor( getColor() - color_increment ); }
    /**
     * Decrement the index for material colors
     *
     * @param {Number} colorDec The color index
     */
    decColor(colorDec) {
        if (colorDec === undefined) {
            if (this.currentParams.colorIndex - 1 >= 0) {
                this.currentParams.colorIndex -= 1;
            } else {
                console.log("The color '" + (this.currentParams.colorIndex - 1).toString() + "' is negative, this attempt will be ignored..");
            }
        } else {
            this.setColor(colorDec);
        }
    }

    // virtual void interpolateColors(int val1, int val2, real_t alpha = 0.5);
    /**
     * [WIP] Mix two colors into one
     *
     * @param {BABYLON.Color4} val1 The primary color
     * @param {BABYLON.Color4} val2 The secondary color
     * @param {Number} alpha The mixing alpha
     */
    interpolateColors(val1, val2, alpha = 0.5) {
        /*var newColor = new BABYLON.Color4.Lerp(this.drawTurtle.materialColors[val1], this.drawTurtle.materialColors[val2], alpha);
        this.drawTurtle.materialColors.push(newColor);
        this.setColor(this.drawTurtle.materialColors.length - 1);*/
    }
    
    // void setCustomAppearance(const AppearancePtr app);
    setCustomAppearance(app) {
        //TODO
    }

    // inline void removeCustomAppearance() { setCustomAppearance(AppearancePtr()); }
    removeCustomAppearance() {
        //TODO
    }

    /**
     * [WIP] Start a new polygon
     */
    // virtual void startPolygon();
    startPolygon() {
        //TODO
    }
    
    // virtual void stopPolygon(bool concavetest = false);
    /**
     * [WIP] Pop a polygon from the stack and render it
     *
     * @param {Boolean} concavetest The concave test
     */
    stopPolygon(concavetest = false) {
        //TODO
    }
    
    // virtual void polygonPoint();
    /**
     * Add a point to the polygon
     */
    polygonPoint() {
        //TODO
    }
    
    // virtual void startGC();
    /**
     * Start a new generalized cylinder
     */
    startGC() {
        this.currentParams.generalizedCylinder = true;
        //__params ->customId = popId();
        //__params ->customParentId = parentId;
    }
    
    // virtual void stopGC();
    /**
     * Pop generalized cylinder from the stack and render it
     */
    stopGC() {
        if (this.currentParams.pointList.length > 1) {
            this.drawTurtle.CreateExtrudeShape("tube" + (this.drawTurtle.graphicElems.length + 1).toString(), { shape: this.currentParams.shapeSection, path: this.currentParams.pointList, sideOrientation: BABYLON.Mesh.DOUBLESIDE, radius: 0.075 }, this.drawTurtle.materialTextures[0]);
            this.currentParams.pointList = [];
        }
        this.currentParams.generalizedCylinder = false;
        this.currentParams.customId = SHAPE_NOID;
        this.currentParams.customParentId = SHAPE_NOID;
    }

    // void _applyTropism();
    /**
     * Apply tropism to the turtle with the current parameters
     */
    applyTropism() {
        this.tendTo(this.currentParams.tropism, this.currentParams.elasticity);
    }

    // virtual void label(const std::string& text, int size = -1 );
    label(text, size = -1) {
        //TODO
    }

	// inline void frame() { frame(default_step); }
    // virtual void frame(real_t heigth, real_t cap_heigth_ratio = 0.2, real_t cap_radius_ratio = 2, real_t color = 1.0, real_t transparency = 0.0);
    frame(height, capHeightRatio = 0.2, capRadiusRatio = 2, color = 1.0, transparency = 0.0) {
        //TODO
    }

    // inline void setTextureScale(real_t u, real_t v) { setTextureScale(TOOLS(Vector2)(u,v)); }
    // virtual void setTextureScale(const TOOLS(Vector2)& s);
    setTextureScale(u, v) {
        //TODO
    }

    // virtual void setTextureVScale(real_t v);
    setTextureVScale(v) {
        //TODO
    }
    
    // virtual void setTextureUScale(real_t u);
    setTextureUScale(u) {
        //TODO
    }

    // inline void setTextureRotation(real_t angle, real_t ucenter = 0.5, real_t vcenter = 0.5) 
    // { setTextureRotation(angle, TOOLS(Vector2)(ucenter,vcenter)); }
    // virtual void setTextureRotation(real_t angle, const TOOLS(Vector2)& center);
    setTextureRotation(angle, ucenter = 0.5, vcenter = 0.5) {
        //TODO
    }

    // inline void setTextureTranslation(real_t u = 0.5, real_t v = 0.5)
    // { setTextureTranslation(TOOLS(Vector2)(u,v)); }
    // virtual void setTextureTranslation(const TOOLS(Vector2)& t);
    setTextureTranslation(u = 0.5, v = 0.5) {
        //TODO
    }

    // virtual void setTextureTransformation(const  TOOLS(Vector2)& scaling, 
	// 								      const TOOLS(Vector2)&  translation, 
	// 									  real_t angle, const TOOLS(Vector2)& rotcenter);
    // inline void setTextureTransformation(real_t uscaling, real_t vscaling, 
	// 							  real_t utranslation, real_t vtranslation, 
	// 							  real_t angle, real_t urotcenter, real_t vrotcenter)
    // { setTextureTransformation(TOOLS(Vector2)(uscaling,vscaling),TOOLS(Vector2)(utranslation,vtranslation), angle, TOOLS(Vector2)(urotcenter, vrotcenter)); }
    setTextureTransformation(scaling, translation, angle, rotcenter) {
        //TODO
    }

    // virtual void setTextureBaseColor(const Color4& v);
    setTextureBaseColor(color) {
        //TODO
    }

    // virtual void interpolateTextureBaseColors(int val1, int val2, real_t alpha = 0.5);
    interpolateTextureBaseColors(val1, val2, alpha = 0.5)
    {
        //TODO
    }

	// void setPositionOnGuide(real_t t);
    setPositionOnGuide(t) {
        //TODO
    }

	// void leftReflection();
    leftReflection() {
        //TODO
    }

	// void upReflection();
    upReflection() {
        //TODO
    }

	// void headingReflection();
    headingReflection() {
        //TODO
    }
};
