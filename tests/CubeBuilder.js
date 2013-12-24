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
