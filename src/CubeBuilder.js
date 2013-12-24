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

	self.calculateCubeVertices = function(cubes, tw, th) {
		var result      = {};
		var a           = self.concatenateCubeJSONArrays(cubes, baseNormals);
		result.tCoords  = getTextureCoords(baseTextureCoords, a.textures, tw, th);
		result.vertices = getPositions(basePositions, a.positions);
		result.indeces  = getIndices(baseIndices, cubes.length, 24);
		result.normals  = a.normals;
		return result;
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

    var getPositions = function(base, arr) {
        var result = new Array(base.length * arr.length / 3);
        var i = 0, r = 0;
        while (i < arr.length) {
            var x = arr[i++], y = arr[i++], z = arr[i++];
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
        var result = new Array(base.length * arr.length / 2);
        var i = 0, r = 0;
        var tW = 1.0 / w, tH = 1.0 / h;
        var fuzz = 1 / 8980;
        while (i < arr.length) {
            var tex = arr[i++];
            var tX = tex % w, tY = Math.floor(tex / w);
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

    var getIndices = function(base, size, interval) {
        var result = new Array(base.length * size);
        var i = 0, r = 0;
        while (i < size) {
            var j = 0;
            while (j < base.length) { result[r++] = base[j++] + interval * i; }
            i++;
        }
        return result;
    }
	return self;
}
