// Warning: this is a compiled file
var Camera = function() {
    var self     = this;
    var fov      = 45; 
    var tooFar   = 100; 
    var tooClose = 0.1; 

    var matrix    = mat4.create();
    self.position = vec3.create();

    self.perspectiveMatrix = function(viewportRatio) {
        mat4.perspective(fov, viewportRatio, tooClose, tooFar, matrix);
        mat4.translate(matrix, self.position);
        return matrix;
    }

    self.setGlPerspective = function(gl, shaderProgram) {
        var viewportRatio = gl.viewportWidth / gl.viewportHeight;
        var m = self.perspectiveMatrix(viewportRatio);
        gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, m);
    }

    self.getX  = function()  { return -self.position[0]; } 
    self.getY  = function()  { return -self.position[1]; } 
    self.getZ  = function()  { return -self.position[2]; } 

    self.moveX = function(d) { self.position[0] += -d;   } 
    self.moveY = function(d) { self.position[1] += -d;   } 
    self.moveZ = function(d) { self.position[2] += -d;   } 

    return self;
}


test("I can move the camera to the left and right", function() {

        var camera = new Camera();
        
        equal(camera.getX(), 0);
        camera.moveX(2);
        equal(camera.getX(), 2);
        camera.moveX(-2);
        equal(camera.getX(), 0);
        camera.moveX(-2);
        equal(camera.getX(), -2);
});

test("I can move the camera up and down", function() {

        var camera = new Camera();
        
        equal(camera.getY(), 0);
        camera.moveY(2);
        equal(camera.getY(), 2);
        camera.moveY(-2);
        equal(camera.getY(), 0);
        camera.moveY(-2);
        equal(camera.getY(), -2);
});

test("I can move the camera back and forth", function() {

        var camera = new Camera();
        
        equal(camera.getZ(), 0);
        camera.moveZ(2);
        equal(camera.getZ(), 2);
        camera.moveZ(-2);
        equal(camera.getZ(), 0);
        camera.moveZ(-2);
        equal(camera.getZ(), -2);
});
var SceneLoader = function() {

    var self = this;
    var sceneHasLoaded = false;

    self.getSceneIfReady = function() {
        if (sceneHasLoaded !== false && sceneHasLoaded.texturesLoaded) { 
			return sceneHasLoaded;
        }
    }

    self.getLoadStatus = function() {
        if (self.getSceneIfReady()) {
            return 'loaded';
        }
        if (!sceneHasLoaded) {
            return "loading scene";
        }
        if (!sceneHasLoaded.texturesLoaded) {
            return 'loading textures';
        }
    }


	self.concatenateCubeJSONArrays = function(cubes, baseVertexNormals) {
		var result = {
			"textures"       : [],
			"shaderPrograms" : [],
			"positions"      : [],
			"normals"        : [],
			"cubePositions"  : []
		}

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
        for (var i = 0; i < tiles.length ; i++) {
             textureCoords = texture.concat(textureCoords);
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

		shape.name      = cubeName;
		shape.json      = cubes;
		shape.positions = a.cubePositions;
		return shape;
	}

    self.buildSceneFromJSON = function(gl, json) {

		var vertexShader    = json.vertexShader;
		var fragmentShader  = json.fragmentShader;
		var textureLocation = json.texture;

        var shader  = new GlShader(gl, vertexShader, fragmentShader);
        var scene   = new GlScene(gl, shader);
        var texture = new GlTexture(gl, textureLocation, scene);

		self.setCubesFromJSON(scene, json, gl, texture);
		self.setLightingFromJSON(scene, json);
		self.setCameraFromJSON(scene, json);
        sceneHasLoaded = scene;
    }


	self.setCubesFromJSON = function(scene, json, gl, texture) {
		for (var cubeName in json.cubes) {
			console.log("Loading cubes: " + cubeName);
			var cubes = self.cubesFromJSONList(json, cubeName, gl, texture);
			scene.addShape(cubes, cubeName, json.cubes[cubeName]);
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
test("I can set the lighting from JSON", function() {

		var json = {
			"light": {
				"ambient"          : [0.1, 0.0, 0.0],
				"direction"        : [-0.5, 1.0, 1.0],
				"directionalColor" : [0.8, 0.8, 0.9]
			}
		}

		var loader = new SceneLoader();
		var ambient, direction, directionalColor;
		var scene = {
			"setAmbientLighting": function(a) { ambient = a; },
			"setDirectionalLighting": function(d, dc) {
				direction = d; directionalColor = dc;
			}
		};

		loader.setLightingFromJSON(scene, json);
		deepEqual(ambient, [0.1, 0.0, 0.0]);
		deepEqual(direction, [-0.5, 1.0, 1.0]);
		deepEqual(directionalColor, [0.8, 0.8, 0.9]);
});

test("I can set the camera position from JSON", function() {

		var json = { "camera": [-0.2,0.5,-35] }
		var loader = new SceneLoader();
		var cameraPosition;
		var scene = { "setCameraPosition": function(p) { cameraPosition = p } }

		loader.setCameraFromJSON(scene, json);
		deepEqual(cameraPosition, [-0.2, 0.5, -35])
});

test("I can concatenate cube definitions", function() {

		var json = [{"t": 1, "s": 2, "v": [0.0, 1.0, 2.0]},
		            {"t": 2, "s": 3, "v": [1.0, 2.0, 4.0]}]
		var loader = new SceneLoader();
		var result = loader.concatenateCubeJSONArrays(json, 7);

		deepEqual(result.textures, [1,2]);
		deepEqual(result.shaderPrograms, [2,3]);
		deepEqual(result.positions, [0.0,1.0,2.0,1.0,2.0,4.0]);
		deepEqual(result.normals, [7, 7]);
});