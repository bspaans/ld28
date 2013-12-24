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
        gl.uniformMatrix4fv(shaderProgram.uPMatrix, false, m);
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

	self.cubesFromJSONList = function(json, cubeName, gl, glTexture) {
		var cubes = json.cubes[cubeName];
		if (!(cubes instanceof Array)) { cubes = [cubes]; }

        var shape = new GlVertices(gl, glTexture);
		var tw = json.texturesPerRow;
		var th = json.texturesPerColumn;
		cubeBuilder.calculateCubeVertices(shape, cubes, json);

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

var GlShader = function(gl) {

    var self = this;

    self.mapShaderVariable = function(variable) {
        self[variable] = gl.getAttribLocation(self.program, variable);
        if (self[variable] === -1) return self[variable] = undefined;
        gl.enableVertexAttribArray(self[variable]);
    }

    self.mapUniformLocation = function(variable) {
        self[variable] = gl.getUniformLocation(self.program, variable);
    }

    self.initShaders = function(fShader, vShader, vars, uniformLocs) {
        self.program = gl.createProgram();
        self.compileAndAttachShader(gl, gl.FRAGMENT_SHADER, fShader);
        self.compileAndAttachShader(gl, gl.VERTEX_SHADER, vShader);
        gl.linkProgram(self.program);
        if (!gl.getProgramParameter(self.program, gl.LINK_STATUS)) {
            throw "Could not initialise shaders";
        }
        gl.useProgram(self.program);
        uniformLocs.map(self.mapUniformLocation);
        vars.map(self.mapShaderVariable);
        return self.program;
    }

    self.compileAndAttachShader = function(gl, shaderType, shaderScript) {
        var shader = gl.createShader(shaderType);
        gl.shaderSource(shader, shaderScript);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.log(gl.getShaderInfoLog(shader));
            return null;
        }
        gl.attachShader(self.program, shader);
        return shader;
    }
    self.assignToShaderVariable = function(gl, attr, buf, item_size) {
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.vertexAttribPointer(self[attr], item_size, gl.FLOAT, false, 0, 0);
    }
    return self;
}
test("I can map a shader variable", function() {

    var enabled = null;
    var gl = { 
        "getAttribLocation": function(p, variable) { return variable; },
        "enableVertexAttribArray": function(a) { enabled = a; }
    };
    var shader = new GlShader(gl);

    shader.mapShaderVariable("test");
    deepEqual(enabled, "test");
    deepEqual(shader.test, "test");
});

test("I can't map a shader variable that doesn't exist", function() {

    var enabled = null;
    var gl = { 
        "getAttribLocation": function(p, variable) { return -1; },
        "enableVertexAttribArray": function(a) { enabled = a; }
    };
    var shader = new GlShader(gl);

    shader.mapShaderVariable("test");
    deepEqual(enabled, null);
    deepEqual(shader["test"], undefined);
});

test("I can map uniform locations", function() {

    var mapped = [];
    var gl = { "getUniformLocation": function(p, v) { mapped.push(v); return v}}
    var shader = new GlShader(gl);

    var map = ["uPMatrix", "uNMatrix"];
    map.map(shader.mapUniformLocation);

    deepEqual(mapped, ["uPMatrix", "uNMatrix"]);
    deepEqual(shader.uPMatrix, "uPMatrix");
    deepEqual(shader.uNMatrix, "uNMatrix");
});
var ModelViewMatrixManager = function() {

    var self = this;
    var mvMatrix = mat4.create();
    var mvMatrixStack = [];

    self.pop  = function() { mvMatrix = mvMatrixStack.pop(); }
    self.push = function() {
        mvMatrixStack.push(mvMatrix);
		mvMatrix = self.getMatrixCopy()
    }
	self.getMatrixCopy = function()  { 
		var copy = mat4.create();
		mat4.set(mvMatrix, copy);
		return copy; 
	}
    self.translate        = function(p) { mat4.translate(mvMatrix, p); }
    self.resetPerspective = function()  { mat4.identity(mvMatrix); }

    self.setMatrixUniforms = function(gl, program) {
        gl.uniformMatrix4fv(program.uMVMatrix, false, mvMatrix);
        var normalMatrix = mat3.create();
        mat4.toInverseMat3(mvMatrix, normalMatrix);
        mat3.transpose(normalMatrix);
        gl.uniformMatrix3fv(program.uNMatrix, false, normalMatrix);
    }
    return self;
}
test("I can translate the mvMatrix", function() {

	var mm = new ModelViewMatrixManager();
	mm.resetPerspective();
	var m1 = mm.getMatrixCopy();
	mm.translate([0.0, 1.0, 0.0]);
	notDeepEqual(m1, mm.getMatrixCopy());
});


test("I can push and pop a mvMatrix on the stack", function() {

	var mm = new ModelViewMatrixManager();
	mm.resetPerspective();
	var m1 = mm.getMatrixCopy();

	mm.push();
	deepEqual(m1, mm.getMatrixCopy());


	mm.translate([0.0, 1.0, 0.0]);
	notDeepEqual(m1, mm.getMatrixCopy());

	mm.pop();
	deepEqual(m1, mm.getMatrixCopy());
	
});
var CubeBuilder = function() {
	var self = this;

    var basePositions = [
      -1.0, -1.0,  1.0,    1.0, -1.0,  1.0,    1.0,  1.0,  1.0,   -1.0,  1.0,  1.0,  // front
      -1.0, -1.0, -1.0,   -1.0,  1.0, -1.0,    1.0,  1.0, -1.0,    1.0, -1.0, -1.0,  // back
      -1.0,  1.0, -1.0,   -1.0,  1.0,  1.0,    1.0,  1.0,  1.0,    1.0,  1.0, -1.0,  // top
      -1.0, -1.0, -1.0,    1.0, -1.0, -1.0,    1.0, -1.0,  1.0,   -1.0, -1.0,  1.0,  // bottom
       1.0, -1.0, -1.0,    1.0,  1.0, -1.0,    1.0,  1.0,  1.0,    1.0, -1.0,  1.0,  // right
      -1.0, -1.0, -1.0,   -1.0, -1.0,  1.0,   -1.0,  1.0,  1.0,   -1.0,  1.0, -1.0   // left
    ];

    var baseIndices = [
       0,  1,  2,    0,  2,  3,  // Front face
       4,  5,  6,    4,  6,  7,  // Back face
       8,  9, 10,    8, 10, 11,  // Top face
      12, 13, 14,   12, 14, 15,  // Bottom face
      16, 17, 18,   16, 18, 19,  // Right face
      20, 21, 22,   20, 22, 23   // Left face
    ];

    var baseTextureCoords = [
      0.0, 0.0,   1.0, 0.0,   1.0, 1.0,   0.0, 1.0, // front
      1.0, 0.0,   1.0, 1.0,   0.0, 1.0,   0.0, 0.0, // back
      0.0, 1.0,   0.0, 0.0,   1.0, 0.0,   1.0, 1.0, // top
      1.0, 1.0,   0.0, 1.0,   0.0, 0.0,   1.0, 0.0, // bottom
      1.0, 0.0,   1.0, 1.0,   0.0, 1.0,   0.0, 0.0, // right
      0.0, 0.0,   1.0, 0.0,   1.0, 1.0,   0.0, 1.0  // left
    ];
    
    var baseNormals = [
       0.0,  0.0,  1.0,    0.0,  0.0,  1.0,    0.0,  0.0,  1.0,    0.0,  0.0,  1.0,   // front 
       0.0,  0.0, -1.0,    0.0,  0.0, -1.0,    0.0,  0.0, -1.0,    0.0,  0.0, -1.0,   // back 
       0.0,  1.0,  0.0,    0.0,  1.0,  0.0,    0.0,  1.0,  0.0,    0.0,  1.0,  0.0,   // top 
       0.0, -1.0,  0.0,    0.0, -1.0,  0.0,    0.0, -1.0,  0.0,    0.0, -1.0,  0.0,   // bottom 
       1.0,  0.0,  0.0,    1.0,  0.0,  0.0,    1.0,  0.0,  0.0,    1.0,  0.0,  0.0,   // right 
      -1.0,  0.0,  0.0,   -1.0,  0.0,  0.0,   -1.0,  0.0,  0.0,   -1.0,  0.0,  0.0,   // left 
    ];

	self.calculateCubeVertices = function(shape, cubes, tw, th) {
		var a        = self.concatenateCubeJSONArrays(cubes, baseNormals);
		var tCoords  = getTextureCoords(baseTextureCoords, a.textures, tw, th);
		var vertices = translatedBaseCopies(basePositions, a.positions);
		var indeces  = arrayFromInterval(baseIndices, cubes.length, 24);
        shape.setVertices(vertices, indeces, tCoords, a.normals);
	}

	self.concatenateCubeJSONArrays = function(cubes, baseVertexNormals) {
		var result = {}
		var initResult = function(a) { result[a] = []; };
		["textures", "positions", "normals", "cubePositions"].map(initResult);

        for (var i = 0, cube ; i < cubes.length, cube = cubes[i]; i++) {
            result.textures.push(cube.t);
            result.positions = result.positions.concat(cube.v);
            result.normals = result.normals.concat(baseVertexNormals);
			result.cubePositions.push([cube.v[0] - 1, cube.v[1] - 1, 2, 2]);
        }
		return result;
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

    var getTextureCoords = function(base, arr, w, h) {
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
test("I can concatenate cube definitions", function() {

		var json = [{"t": 1, "v": [0.0, 1.0, 2.0]},
		            {"t": 2, "v": [1.0, 2.0, 4.0]}]
		var builder = new CubeBuilder();
		var result = builder.concatenateCubeJSONArrays(json, 7);

		deepEqual(result.textures, [1,2]);
		deepEqual(result.positions, [0.0,1.0,2.0,1.0,2.0,4.0]);
		deepEqual(result.normals, [7, 7]);
});


test("I can calculate cube vertices", function() {

		var shape = function(result) { return { 
				"setVertices": function(vert, indeces, tCoords, normals) {
					result.vert = vert;
					result.indeces = indeces;
					result.tCoords = tCoords;
					result.normals = normals;
				}
			}
		};
		var builder1 = new CubeBuilder();
		var builder2 = new CubeBuilder();
		var result1 = {}
		var result2 = {}
		var result3 = {}
		var shape1 = shape(result1);
		var shape2 = shape(result2);
		var shape3 = shape(result3);

		var cubes1 = [{"t": 1, "v": [0.0, 1.0, 2.0]},
		              {"t": 2, "v": [1.0, 2.0, 4.0]}]
		var cubes2 = [{"t": 1, "v": [4.0, 1.0, 2.0]},
		              {"t": 2, "v": [9.0, 2.0, 4.0]}]

		builder1.calculateCubeVertices(shape1, cubes1, 2, 2);
		builder2.calculateCubeVertices(shape2, cubes2, 2, 2);
		deepEqual(result1.tCoords, result2.tCoords);
		notDeepEqual(result1.vert, result2.vert);

		var cubes3 = cubes1.concat(cubes2);
		builder1.calculateCubeVertices(shape3, cubes3, 2, 2);
		equal(result1.vert.length + result2.vert.length, result3.vert.length);
		equal(result1.indeces.length + result2.indeces.length, result3.indeces.length);
		equal(result1.tCoords.length + result2.tCoords.length, result3.tCoords.length);
		equal(result1.normals.length + result2.normals.length, result3.normals.length);
});
