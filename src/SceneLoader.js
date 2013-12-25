require(["CubeBuilder"]);
var SceneLoader = function() {
    var self = this;
    var loadedScene = undefined;
	var cubeBuilder = new CubeBuilder();
	self.texturesLoaded = false;

    self.getSceneIfReady = function() {
        return loadedScene && self.texturesLoaded ? loadedScene : undefined;
    }

    self.getLoadStatus = function() {
        if (self.getSceneIfReady()) { return 'loaded';           } 
        if (!loadedScene)           { return "loading scene";    } 
        if (!self.texturesLoaded)   { return 'loading textures'; } 
    }

	var buildShape = function(a, gl, glTexture, cubes, tw, th) {
        var shape = new GlVertices(gl, glTexture);
        shape.setVertices(a.vertices, a.indeces, a.tCoords, a.normals);
		shape.json = cubes;
		shape.positions = a.cubePositions;
		return shape;
	}

	self.cubesFromJSONList = function(json, cubeName, gl, glTexture) {
		var cubes = json.cubes[cubeName];
        var tw = json.texturesPerRow, th = json.texturesPerColumn;
        if (cubes.compiled) {
            var a = cubes;
        } else { 
            if (!(cubes instanceof Array)) { cubes = [cubes]; }
            var a = cubeBuilder.calculateCubeVertices(cubes, tw, th);
        }
		return buildShape(a, gl, glTexture, cubes, tw, th);
	}

	self.getShaderFromJSON = function(gl, json) {
        var shader  = new GlShader(gl);
		shader.initShaders(
				self.readTextFromScriptAttribute(json.shader.fragment), 
				self.readTextFromScriptAttribute(json.shader.vertex), 
				json.shader.variables, json.shader.uniformLocations);
		return shader;
	}

    self.buildSceneFromJSON = function(gl, json) {
		var shader  = self.getShaderFromJSON(gl, json);
        var scene   = new GlScene(gl, shader);
        var texture = new GlTexture(gl, json.texture, self);

		self.setCubesFromJSON(scene, json, gl, texture);
		self.setLightingFromJSON(scene, json);
		self.setCameraFromJSON(scene, json);
        loadedScene = scene;
    }

    self.readTextFromScriptAttribute = function(id) {
		var elem = document.getElementById(id);
        var str = "";
        var k = elem.firstChild;
        while (k) {
            if (k.nodeType == 3) { str += k.textContent; }
            k = k.nextSibling;
        }
        return str;
    }

	self.setCubesFromJSON = function(scene, json, gl, texture) {
		for (var cubeName in json.cubes) {
			console.log("Loading cubes: " + cubeName);
			var cubes = self.cubesFromJSONList(json, cubeName, gl, texture);
			scene.addShape(cubes, cubeName);
		}
	}

	self.setLightingFromJSON = function(scene, json) {
		var ambient        = json.light.ambient;
		var direction      = json.light.direction;
		var directionColor = json.light.directionalColor;
		scene.setAmbientLighting(ambient);
		scene.setDirectionalLighting(direction, directionColor);
	}

	self.setCameraFromJSON = function(scene, json) {
        scene.setCameraPosition(json.camera);
	}
    return self;
}
