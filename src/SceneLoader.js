require(["CubeBuilder", "GlShader", "GlVertices", "GlTexture", "GlScene"]);
var SceneLoader = function() {
    var self = this;
    var loadedScene = undefined;
	var cubeBuilder = new CubeBuilder();
	self.texturesLoaded = false;
    var factory = undefined;

    self.setFactory = function(f) { factory = f; }

    self.getSceneIfReady = function() {
        return loadedScene && self.texturesLoaded ? loadedScene : undefined;
    }

    self.getLoadStatus = function() {
        if (self.getSceneIfReady()) { return 'loaded';           } 
        if (!loadedScene)           { return "loading scene";    } 
        if (!self.texturesLoaded)   { return 'loading textures'; } 
    }

	var buildShape = function(a, texture, cubes, tw, th) {
        var shape = factory.makeVertices(texture);
        shape.setVertices(a.vertices, a.indeces, a.tCoords, a.normals);
		shape.json = cubes;
		shape.positions = a.cubePositions;
		return shape;
	}

	self.cubesFromJSONList = function(json, cubeName, texture) {
		var cubes = json.cubes[cubeName];
        var tw = json.texturesPerRow, th = json.texturesPerColumn;
        if (cubes.compiled) {
            var a = cubes;
        } else { 
            if (!(cubes instanceof Array)) { cubes = [cubes]; }
            var a = cubeBuilder.calculateCubeVertices(cubes, tw, th);
        }
		return buildShape(a, texture, cubes, tw, th);
	}

	self.getShaderFromJSON = function(json) {
        var shader  = factory.makeShader();
		shader.initShaders(
				self.readTextFromScriptAttribute(json.shader.fragment), 
				self.readTextFromScriptAttribute(json.shader.vertex), 
				json.shader.variables, json.shader.uniformLocations);
		return shader;
	}

    self.buildSceneFromJSON = function(json) {
        if (factory === undefined) {
            throw "Factory is not set";
        }
		var shader  = self.getShaderFromJSON(json);
        var scene   = factory.makeScene(shader);
        var texture = factory.makeTexture(json.texture, self);

		self.setCubesFromJSON(scene, json, texture);
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

	self.setCubesFromJSON = function(scene, json, texture) {
		for (var cubeName in json.cubes) {
			console.log("Loading cubes: " + cubeName);
			var cubes = self.cubesFromJSONList(json, cubeName, texture);
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
