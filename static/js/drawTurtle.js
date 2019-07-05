/**
 * @file drawTurtle.js
 * @author Maxime Cauvin <maxime.cauvin@epitech.eu> Renan Berruex <renan.berruex@epitech.eu>
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
        this.engine = new BABYLON.Engine(this.canvas, true);
        this.scene = new BABYLON.Scene(this.engine);
		this.scene.clearColor = new BABYLON.Color3(0.8, 0.8, 0.8);

		this.camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 15, new BABYLON.Vector3(0, 0, 0), this.scene);
		this.camera.setPosition(new BABYLON.Vector3(0, 0, 15));
		this.camera.attachControl(this.canvas, true);

        this.light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, -5, 3), this.scene);
        this.light.intensity = 1;

        this.graphicElems = [];
		this.materialColors = [];
        this.materialTextures = [];

        var CoT = this.LocalAxes(2, 0);

        var options = new BABYLON.SceneOptimizerOptions.LowDegradationAllowed();
        options.addOptimization(new BABYLON.HardwareScalingOptimization(0, 1));
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
        var hexColors = ["#FFFFFFFF", "#FFB71CFF", "#53FF00FF", "#FF0000FF", "#FFFF00FF", "#0000FFFF", "#FF00FFFF"];
        for (var i in hexColors) {
            this.AddMaterialColor(hexColors[i] + "Color", hexColors[i], "#00000000", "#00000000", "#00000000");
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
            new BABYLON.Vector3.Zero(), new BABYLON.Vector3(size, 0, 0), new BABYLON.Vector3(size * 0.95, 0.05 * size, 0),
            new BABYLON.Vector3(size, 0, 0), new BABYLON.Vector3(size * 0.95, -0.05 * size, 0)
        ], this.scene);
        pilot_local_axisX.color = new BABYLON.Color3(1, shade, shade);

        var pilot_local_axisY = BABYLON.Mesh.CreateLines("pilot_local_axisY", [
            new BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, size, 0), new BABYLON.Vector3(-0.05 * size, size * 0.95, 0),
            new BABYLON.Vector3(0, size, 0), new BABYLON.Vector3(0.05 * size, size * 0.95, 0)
        ], this.scene);
        pilot_local_axisY.color = new BABYLON.Color3(shade, 1, shade);

        var pilot_local_axisZ = BABYLON.Mesh.CreateLines("pilot_local_axisZ", [
            new BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, 0, size), new BABYLON.Vector3(0, -0.05 * size, size * 0.95),
            new BABYLON.Vector3(0, 0, size), new BABYLON.Vector3(0, 0.05 * size, size * 0.95)
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

        var rotationMatrix = BABYLON.Vector3.RotationFromAxis(currentParams.up, currentParams.heading, currentParams.left);
        var boxHeight = box.getBoundingInfo().boundingBox.vectorsWorld[1].y + -(box.getBoundingInfo().boundingBox.vectorsWorld[0].y);
        box.translate(BABYLON.Axis.Y, boxHeight / 2, BABYLON.Space.LOCAL);

        var CoT = new BABYLON.TransformNode("root");
        CoT.position = currentParams.position;
        CoT.rotation = rotationMatrix;
        box.parent = CoT;
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

        var rotationMatrix = BABYLON.Vector3.RotationFromAxis(currentParams.up, currentParams.heading, currentParams.left);

        var CoT = new BABYLON.TransformNode("root");
        CoT.position = currentParams.position;
        CoT.rotation = rotationMatrix;
        sphere.parent = CoT;
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
        this.graphicElems.push(BABYLON.MeshBuilder.CreateDisc(id, settings, this.scene));
        var polygon = this.graphicElems[this.graphicElems.length - 1];
        polygon.material = material;

        var rotationMatrix = BABYLON.Vector3.RotationFromAxis(currentParams.up, currentParams.heading, currentParams.left);
        var polygonHeight = polygon.getBoundingInfo().boundingBox.vectorsWorld[1].y + -(polygon.getBoundingInfo().boundingBox.vectorsWorld[0].y);
        polygon.translate(BABYLON.Axis.Y, polygonHeight / 2, BABYLON.Space.LOCAL);

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
        this.graphicElems.push(BABYLON.MeshBuilder.ExtrudeShape(id, settings, this.scene));
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
		for (var i in this.graphicElems) {
            this.graphicElems[i].dispose()
			this.scene.removeMesh(this.graphicElems[i]);
		}
		this.graphicElems = []
    }
}