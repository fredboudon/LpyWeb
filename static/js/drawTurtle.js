/**
 * @file drawTurtle.js
 * @author Maxime Cauvin <maxime.cauvin@epitech.eu> and Renan Berruex <renan.berruex@epitech.eu> and Anthony Scriven <scriven.anthony@gmail.com>
 * @version 0.1
 */

/**
 * Manage meshs for drawing trees
 */
class drawTurtle {
    /**
     * drawTurtle constructor - Initialize the BabylonJS scene and other things related to it
     */
    constructor() {
		
        this.canvas = document.getElementById("renderCanvas");
        this.engine = new BABYLON.Engine(this.canvas, true, { preserveDrawingBuffer: true, stencil: true });
        this.scene = new BABYLON.Scene(this.engine);
		this.scene.clearColor = new BABYLON.Color3.FromHexString("#A3A3A3");

		this.camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 5, new BABYLON.Vector3(0, 0, 0), this.scene);
		this.camera.setPosition(new BABYLON.Vector3(0, 0, 15));
        this.camera.wheelPrecision = 100.0;
        this.camera.pinchPrecision = 100.0;
		this.camera.attachControl(this.canvas, true);

        this.light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 15, 15), this.scene);
        this.light.intensity = 1;

        this.graphicElems = [];
		this.materialColors = [];
        this.materialTextures = [];

        this.CoT = this.LocalAxes(42, 0);

        var options = new BABYLON.SceneOptimizerOptions();
        options.addOptimization(new BABYLON.LensFlaresOptimization(0));
        options.addOptimization(new BABYLON.ShadowsOptimization(0));
        options.addOptimization(new BABYLON.PostProcessesOptimization(1));
        options.addOptimization(new BABYLON.ParticlesOptimization(1));
        options.addOptimization(new BABYLON.TextureOptimization(2, 1024));
        this.optimizer = new BABYLON.SceneOptimizer(this.scene, options);

		this.InitializeMaterialsColors();      
    }

	
    /**
     * Load and add a new color usable later
     * Color format is: "#RRGGBBAA"
     * 
     * @param {String} id The color material identifier
     * @param {String} diffuseColor The diffuse color applied
     * @param {String} specularColor The specular color applied
     * @param {String} emissiveColor The emissive color applied
     * @param {String} ambientColor The ambient color applied
     */
    AddMaterialColor(id, diffuseColor, specularColor, emissiveColor, ambientColor) {
        var mat = new BABYLON.StandardMaterial(id, this.scene);
        mat.diffuseColor = new BABYLON.Color4.FromHexString(diffuseColor);
        mat.specularColor = new BABYLON.Color4.FromHexString(specularColor);
        mat.emissiveColor = new BABYLON.Color4.FromHexString(emissiveColor);
        mat.ambientColor = new BABYLON.Color4.FromHexString(ambientColor);
        this.materialColors.push(mat);
    }
	
	/**
     * Initialize some materials colors
     */
    InitializeMaterialsColors() {
        this.materialColors = [];
        var hexColors = ["#FFFFFFFF", "#FFB71CFF", "#53FF00FF", "#FF0000FF", "#FFFF00FF", "#0000FFFF", "#FF00FFFF"]; //Alpha value has been deleted because <input type="color"/> use "RRGGBB" format
        for (var i in hexColors) {
            this.AddMaterialColor(hexColors[i], hexColors[i], "#00000000", "#00000000", "#00000000");
        }
    }
	
	/**
     * Load and add a new texture usable later
     * 
     * @param {String} id The material texture identifier
     * @param {String} texturePath The path to the texture
     * @param {String} normalPath The path to the normal texture (optional)
     */
    AddMaterialTexture(id, texturePath, normalPath = "") {
        var mat = new BABYLON.StandardMaterial(id, this.scene);
        mat.diffuseTexture = new BABYLON.Texture(texturePath, this.scene);
        if (normalPath !== "") {
            mat.bumpTexture = new BABYLON.Texture(normalPath, this.scene);
        }
        this.materialTextures.push(mat);
    }



    /**
     * Draw 3D Axes arrows
     * 
     * @param {Number} size The length of each arrow
     * @param {Number} shade The amount of white added to the arrow colors (between 0 and 1)
     */
    LocalAxes(size, shade) {
        var pilot_local_axisX = BABYLON.Mesh.CreateLines("pilot_local_axisX", [
            new BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, 0, size)
        ], this.scene);
        pilot_local_axisX.color = new BABYLON.Color3(1, shade, shade);

        var pilot_local_axisY = BABYLON.Mesh.CreateLines("pilot_local_axisY", [
            new BABYLON.Vector3.Zero(), new BABYLON.Vector3(-size, 0, 0)
        ], this.scene);
        pilot_local_axisY.color = new BABYLON.Color3(shade, 1, shade);

        var pilot_local_axisZ = BABYLON.Mesh.CreateLines("pilot_local_axisZ", [
            new BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, size, 0)
        ], this.scene);
        pilot_local_axisZ.color = new BABYLON.Color3(shade, shade, 1);

        var local_origin = BABYLON.MeshBuilder.CreateBox("local_origin", { size: 1 }, this.scene);
        local_origin.isVisible = false;

        pilot_local_axisX.parent = local_origin;
        pilot_local_axisY.parent = local_origin;
        pilot_local_axisZ.parent = local_origin;

        return local_origin;
    }

    /**
     * Draw the Turtle
     * 
     * @param {Object} settings The cylinder settings
     * @param {Object} currentParams Current turtle parameters
     */
    CreateFrame(settings, currentParams) {
        //Turtle's Heading
        this.graphicElems.push(BABYLON.MeshBuilder.CreateCylinder('frameHCylinder', settings, this.scene));
        var mesh = this.graphicElems[this.graphicElems.length - 1];

        var mat = new BABYLON.StandardMaterial("#FF0000FF", this.scene);
        mat.diffuseColor = new BABYLON.Color4.FromHexString("#FF0000FF");
        mat.specularColor = new BABYLON.Color4.FromHexString("#00000000");
        mat.emissiveColor = new BABYLON.Color4.FromHexString("#FF0000FF");
        mat.ambientColor = new BABYLON.Color4.FromHexString("#FF0000FF");
       
        mesh.material = mat;
        
        var rotationMatrix = BABYLON.Vector3.RotationFromAxis(currentParams.up, currentParams.heading, currentParams.left);
        var cylinderHeight = mesh.getBoundingInfo().boundingBox.vectorsWorld[1].y + -(mesh.getBoundingInfo().boundingBox.vectorsWorld[0].y);
        mesh.translate(BABYLON.Axis.Y, cylinderHeight / 2, BABYLON.Space.LOCAL);

        var CoT = new BABYLON.TransformNode("root");
        CoT.position = currentParams.position;
        CoT.rotation = rotationMatrix;
        mesh.parent = CoT;

        this.graphicElems.push(BABYLON.MeshBuilder.CreateCylinder('frameHCylinderTop', {height : settings.height / 6, diameterBottom : settings.diameter * 2, diameterTop : 0}, this.scene));
        var mesh2 = this.graphicElems[this.graphicElems.length - 1];
        mesh2.translate(BABYLON.Axis.Y, cylinderHeight / 2, BABYLON.Space.LOCAL);
        mesh2.material = mat;
        mesh2.parent = mesh;

        //Turtle's Left
        this.graphicElems.push(BABYLON.MeshBuilder.CreateCylinder('frameLCylinder', settings, this.scene));
        var mesh3 = this.graphicElems[this.graphicElems.length - 1];

        var mat2 = new BABYLON.StandardMaterial("#53FF00FF", this.scene);
        mat2.diffuseColor = new BABYLON.Color4.FromHexString("#53FF00FF");
        mat2.specularColor = new BABYLON.Color4.FromHexString("#00000000");
        mat2.emissiveColor = new BABYLON.Color4.FromHexString("#53FF00FF");
        mat2.ambientColor = new BABYLON.Color4.FromHexString("#53FF00FF");
       
        mesh3.material = mat2;
        mesh3.rotate(BABYLON.Axis.X, (-90 * (Math.PI/180)), BABYLON.Space.LOCAL);
        mesh3.translate(BABYLON.Axis.Y, cylinderHeight / 2, BABYLON.Space.LOCAL);
        mesh3.parent = CoT

        this.graphicElems.push(BABYLON.MeshBuilder.CreateCylinder('frameLCylinderTop', {height : settings.height / 6, diameterBottom : settings.diameter * 2, diameterTop : 0}, this.scene));
        var mesh4 = this.graphicElems[this.graphicElems.length - 1];
        mesh4.translate(BABYLON.Axis.Y, cylinderHeight / 2, BABYLON.Space.LOCAL);
        mesh4.material = mat2;
        mesh4.parent = mesh3;

        //Turtle's Up
        this.graphicElems.push(BABYLON.MeshBuilder.CreateCylinder('frameUCylinder', settings, this.scene));
        var mesh5 = this.graphicElems[this.graphicElems.length - 1];

        var mat3 = new BABYLON.StandardMaterial("#0000FFFF", this.scene);
        mat3.diffuseColor = new BABYLON.Color4.FromHexString("#0000FFFF");
        mat3.specularColor = new BABYLON.Color4.FromHexString("#00000000");
        mat3.emissiveColor = new BABYLON.Color4.FromHexString("#0000FFFF");
        mat3.ambientColor = new BABYLON.Color4.FromHexString("#0000FFFF");

        mesh5.material = mat3;
        mesh5.rotate(BABYLON.Axis.Z, (-90 * (Math.PI/180)), BABYLON.Space.LOCAL);
        mesh5.translate(BABYLON.Axis.Y, cylinderHeight / 2, BABYLON.Space.LOCAL);
        mesh5.parent = CoT

        this.graphicElems.push(BABYLON.MeshBuilder.CreateCylinder('frameUCylinderTop', {height : settings.height / 6, diameterBottom : settings.diameter * 2, diameterTop : 0}, this.scene));
        var mesh6 = this.graphicElems[this.graphicElems.length - 1];
        mesh6.translate(BABYLON.Axis.Y, cylinderHeight / 2, BABYLON.Space.LOCAL);
        mesh6.material = mat3;
        mesh6.parent = mesh5;
    }

    /**
     * Create a cylinder with the turtle parameters given
     *
     * @param {String} id The cylinder identifier
     * @param {Object} settings The cylinder settings
     * @param {Object} currentParams Current turtle parameters
     * @param {BABYLON.StandardMaterial} material The material to be applied on the cylinder
     */
    CreateCylinder(id, settings, currentParams, material) {
        this.graphicElems.push(BABYLON.MeshBuilder.CreateCylinder(id, settings, this.scene));
        var cylinder = this.graphicElems[this.graphicElems.length - 1];
        cylinder.material = material;
        cylinder.scaling = currentParams.scale;

        var rotationMatrix = BABYLON.Vector3.RotationFromAxis(currentParams.up, currentParams.heading, currentParams.left);
        var cylinderHeight = cylinder.getBoundingInfo().boundingBox.vectorsWorld[1].y + -(cylinder.getBoundingInfo().boundingBox.vectorsWorld[0].y);

        cylinder.translate(BABYLON.Axis.Y, cylinderHeight / 2, BABYLON.Space.LOCAL);

        var CoT = new BABYLON.TransformNode("root");
        CoT.position = currentParams.position;
        CoT.rotation = rotationMatrix;
        cylinder.parent = CoT;
    }

    /**
     * Create a box with the turtle parameters given
     *
     * @param {String} id The box identifier
     * @param {Object} settings The box settings
     * @param {Object} currentParams Current turtle parameters
     * @param {BABYLON.StandardMaterial} material The material to be applied on the box
     */
    CreateBox(id, settings, currentParams, material) {
        this.graphicElems.push(BABYLON.MeshBuilder.CreateBox(id, settings, this.scene));
        var box = this.graphicElems[this.graphicElems.length - 1];
        box.material = material;
        box.scaling = currentParams.scale;

        var rotationMatrix = BABYLON.Vector3.RotationFromAxis(currentParams.up, currentParams.heading, currentParams.left);
        var boxHeight = box.getBoundingInfo().boundingBox.vectorsWorld[1].y + -(box.getBoundingInfo().boundingBox.vectorsWorld[0].y);
        box.translate(BABYLON.Axis.Y, boxHeight / 2, BABYLON.Space.LOCAL);

        var CoT = new BABYLON.TransformNode("root");
        CoT.position = currentParams.position;
        CoT.rotation = rotationMatrix;
        box.parent = CoT;
    }

    /**
     * Create a plane mesh with the turtle parameters given
     *
     * @param {String} id The plane identifier
     * @param {Object} settings The plane settings
     * @param {Object} currentParams Current turtle parameters
     * @param {BABYLON.StandardMaterial} material The material to be applied on the plane
     */
    CreatePlane(id, settings, currentParams, material) {
        this.graphicElems.push(BABYLON.MeshBuilder.CreatePlane(id, settings, this.scene));
        var plane = this.graphicElems[this.graphicElems.length - 1];
        plane.material = material;
        plane.scaling = currentParams.scale;

        var rotationMatrix = BABYLON.Vector3.RotationFromAxis(currentParams.up, currentParams.heading, currentParams.left);
        var planeHeight = plane.getBoundingInfo().boundingBox.vectorsWorld[1].y + -(plane.getBoundingInfo().boundingBox.vectorsWorld[0].y);
        plane.translate(BABYLON.Axis.Y, planeHeight / 2, BABYLON.Space.LOCAL);

        var CoT = new BABYLON.TransformNode("root");
        CoT.position = currentParams.position;
        CoT.rotation = rotationMatrix;
        plane.parent = CoT;
    }

    /**
     * Create a sphere with the turtle parameters given
     *
     * @param {String} id The sphere identifier
     * @param {Object} settings The sphere settings
     * @param {Object} currentParams Current turtle parameters
     * @param {BABYLON.StandardMaterial} material The material to be applied on the sphere
     */
    CreateSphere(id, settings, currentParams, material) {
        this.graphicElems.push(BABYLON.MeshBuilder.CreateSphere(id, settings, this.scene));

        var sphere = this.graphicElems[this.graphicElems.length - 1];
        sphere.material = material;
        sphere.scaling = currentParams.scale;

        var rotationMatrix = BABYLON.Vector3.RotationFromAxis(currentParams.up, currentParams.heading, currentParams.left);

        var CoT = new BABYLON.TransformNode("root");
        CoT.position = currentParams.position;
        CoT.rotation = rotationMatrix;
        sphere.parent = CoT;
    }

    /**
     * Create a disc with the turtle parameters given
     *
     * @param {String} id The disc identifier
     * @param {Object} settings The disc settings
     * @param {Object} currentParams Current turtle parameters
     * @param {BABYLON.StandardMaterial} material The material to be applied on the disc
     */
    CreateDisc(id, settings, currentParams, material) {
        this.graphicElems.push(BABYLON.MeshBuilder.CreateDisc(id, settings, this.scene));

        var disc = this.graphicElems[this.graphicElems.length - 1];
        disc.material = material;
        disc.scaling = currentParams.scale;

        var rotationMatrix = BABYLON.Vector3.RotationFromAxis(currentParams.up, currentParams.heading, currentParams.left);

        var CoT = new BABYLON.TransformNode("root");
        CoT.position = currentParams.position;
        CoT.rotation = rotationMatrix;
        disc.parent = CoT;
    }

    /**
     * Create a surface with the turtle parameters given (to be fixed)
     *
     * @param {String} id The surface identifier
     * @param {Object} currentParams Current turtle parameters
     */
    CreateSurface(id, currentParams) {
        var surface = this.scene.getMeshesByID(id);
        var surfaceCloning = [];
        console.log(surface);
        for (var i in surface) {
            surfaceCloning.push(surface[i].clone("clone"));
            surfaceCloning[i].isVisible = true;

            var rotationMatrix = BABYLON.Vector3.RotationFromAxis(currentParams.up, currentParams.heading, currentParams.left);
            //surface[i].translate(BABYLON.Axis.Y, surfaceHeight / 2, BABYLON.Space.LOCAL);

            var CoT = new BABYLON.TransformNode("root");
            CoT.position = currentParams.position;
            CoT.rotation = rotationMatrix;
            surfaceCloning[i].parent = CoT;
        }
        console.log(surfaceCloning);
    }

    /**
     * Create a polygon with the turtle parameters given
     *
     * @param {String} id The polygon identifier
     * @param {Object} settings The polygon settings
     * @param {Object} currentParams Current turtle parameters
     * @param {BABYLON.StandardMaterial} material The material to be applied on the polygon
     */
    CreatePolygon(id, settings, currentParams, material) {
        this.graphicElems.push(BABYLON.MeshBuilder.CreatePolygon(id, settings, this.scene));
        var polygon = this.graphicElems[this.graphicElems.length - 1];
        polygon.material = material;

        var rotationMatrix = BABYLON.Vector3.RotationFromAxis(currentParams.up, currentParams.heading, currentParams.left);
        var polygonHeight = polygon.getBoundingInfo().boundingBox.vectorsWorld[1].y + -(polygon.getBoundingInfo().boundingBox.vectorsWorld[0].y);
        polygon.translate(BABYLON.Axis.Y, polygonHeight / 2, BABYLON.Space.LOCAL);

        polygon.rotate(BABYLON.Axis.Z, (90 * (Math.PI/180)), BABYLON.Space.LOCAL);
        polygon.rotate(BABYLON.Axis.Y, (90 * (Math.PI/180)), BABYLON.Space.LOCAL);

        var CoT = new BABYLON.TransformNode("root");
        CoT.position = currentParams.position;
        CoT.rotation = rotationMatrix;
        polygon.parent = CoT;
    }

    /**
     * Create an extruded shape
     *
     * @param {String} id The shape identifier
     * @param {Object} settings The shape settings
     * @param {BABYLON.StandardMaterial} material The material to be applied on the shape
     */
    CreateExtrudeShape(id, settings, material) {
        this.graphicElems.push(BABYLON.MeshBuilder.ExtrudeShapeCustom(id, settings, this.scene));
        var shape = this.graphicElems[this.graphicElems.length - 1];
        shape.material = material;
    }

    /**
     * Import a custom mesh on the scene
     * 
     * @param {any} meshNames An array of mesh names, a single mesh name, or empty string for all meshes that filter what meshes are imported
     * @param {String} rootUrl A string that defines the root url for scene and resources
     * @param {String} sceneFilename A string that defines the name of the scene file. can start with "data:" following by the stringified version of the scene
     * @param {BABYLON.Scene} scene The instance of BABYLON.Scene to append to
     * @param {Nullable<function>} onSuccess A callback with a list of imported meshes, particleSystems, and skeletons when import succeeds
     * @param {Nullable<function>} onProgress A callback with a progress event for each file being loaded
     * @param {Nullable<function>} onError A callback with the scene, a message, and possibly an exception when import fails
     */
    ImportMesh(meshNames, rootUrl, sceneFilename, scene, onSuccess, onProgress = () => { }, onError = () => { }) {
        BABYLON.SceneLoader.ImportMesh(meshNames, rootUrl, sceneFilename, scene, onSuccess, onProgress, onError);
    }
	
	/**
     * Delete all the meshs in the mesh array : drawTurtle.graphicElems[]
     */
	DeleteTrees() {
		for (let i in this.graphicElems) {
            this.scene.removeMesh(this.graphicElems[i]);
            this.graphicElems[i].dispose(true, true);
		}
        for (let i in this.materialColors) {
            this.materialColors[i].dispose(true, true);
            this.scene.removeMaterial(this.materialColors[i]);
        }
        for (let i in this.materialTextures) {
            this.materialTextures[i].dispose(true, true);
            this.scene.removeTexture(this.materialTextures[i]);
        }
        this.graphicElems = [];
     }

    /**
     * Reset the position of the camera to it's inital state 
     */

    ResetCamera() {
        this.camera.setPosition(new BABYLON.Vector3(0, 0, 15));
        this.camera.target = new BABYLON.Vector3(0,0,0);
        this.camera.attachControl(this.canvas, true);
    }
}