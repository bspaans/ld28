var SceneLoader = function() {

    var self = this;
    var loadedScene = undefined;
	self.texturesLoaded = false;

    self.getSceneIfReady = function() {
        return loadedScene && self.texturesLoaded ? loadedScene : undefined;
    }

    self.getLoadStatus = function() {
        if (self.getSceneIfReady()) { return 'loaded';           } 
        if (!loadedScene)           { return "loading scene";    } 
        if (!self.texturesLoaded)   { return 'loading textures'; } 
    }

	self.concatenateCubeJSONArrays = function(cubes, baseVertexNormals) {
		var result = {}
		var arrays = ["textures", "shaderPrograms", "positions", 
					  "normals", "cubePositions"];
		arrays.map(function(a) { result[a] = []; });

        for (var i = 0 ; i < cubes.length; i++) {
            var cube = cubes[i];
            result.textures.push(cube.t);
            result.shaderPrograms.push(cube.s);
            result.positions = result.positions.concat(cube.v);
            result.normals = result.normals.concat(baseVertexNormals);
			result.cubePositions.push([cube.v[0] - 1, cube.v[1] - 1, 2, 2]);
        }
		return result;
	}

	self.getTextureCoords = function(baseCoords, tiles, w, h) {
        var textureCoords = [];
        var texture       = textureCoordArray(baseCoords, tiles, w, h);
		// TODO: necessary? textureCoords = texture   // enough?
        for (var i = 0; i < tiles.length ; i++) {
             textureCoords = textureCoords.concat(texture);
        }
		return textureCoords;
	}

	self.calculateCubeVertices = function(shape, cubes, json) {

		var baseNormals     = shape.baseVertexNormals;
		var baseCube        = shape.buseCube;
		var baseCubeIndeces = shape.baseCubeIndeces;
		var baseTexture     = shape.baseCubeTextureCoords;
		var tw = json.texturesPerRow;
		var th = json.texturesPerColumn;

		var a        = self.concatenateCubeJSONArrays(cubes, baseNormals);
		var vertices = translatedBaseCopies(baseCube, a.positions);
		var indeces  = arrayFromInterval(baseCubeIndeces, cubes.length, 24);
		var tCoords  = self.getTextureCoords(baseTexture, a.textures, tw, th);

        shape.setVertices(vertices, indeces, tCoords, a.normals);
	}


	self.cubesFromJSONList = function(json, cubeName, gl, glTexture) {
		var cubes = json.cubes[cubeName];
		if (!(cubes instanceof Array)) { cubes = [cubes]; }

        var shape = new GlVertices(gl, glTexture);
		self.calculateCubeVertices(shape, cubes, json);

		shape.json      = cubes;
		shape.positions = a.cubePositions;
		return shape;
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

    // arr = [x0, y0, z0, x1, y1, z1, ...]
    var translatedBaseCopies = function(base, arr) {
        var result = new Array(base.length * arr.length / 3);
        var current = base;
        var i = 0;
        var r = 0;
        while (i < arr.length) {
            var x = arr[i++];
            var y = arr[i++];
            var z = arr[i++];
            var j = 0;
            while (j < base.length) {
                result[r++] = base[j++] + x;
                result[r++] = base[j++] + y;
                result[r++] = base[j++] + z;
            }
        }
        return result;
    }

    var textureCoordArray = function(base, arr, w, h) {

        var clamp = function(v, mi, ma) {
            if (v < mi) v = mi;
            if (v > ma) v = ma;
            return v;
        }

        var result = new Array(base.length * arr.length);
        var current = base;
        var i = 0;
        var r = 0;
        
        var tW = 1.0 / w;
        var tH = 1.0 / h;
        var fuzz = 1 / 8980;
        while (i < arr.length) {
            var tex = arr[i++];
            var tX = tex % w;
            var tY = Math.floor(tex / w);
            var j = 0;
            while (j < base.length) {
                var b = (base[j++] + tX) / w;
                result[r++] = clamp(b, b + fuzz, b + tW - fuzz);
                b = 1.0 - ((base[j++] + tY) / h);
                result[r++] = clamp(b, b + fuzz, b + tH - fuzz);; 
            }
        }
        return result;
    }

    var arrayFromInterval = function(base, size, interval) {
        var result = new Array(base.length * size);
        var current = base;
        var i = 0;
        var r = 0;
        while (i < size) {
            var j = 0;
            while (j < base.length) {
                result[r++] = base[j++] + interval * i;
            }
            i++;
        }
        return result;
    }

    return self;
}
