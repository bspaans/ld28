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

		var builder1 = new CubeBuilder();
		var builder2 = new CubeBuilder();

		var cubes1 = [{"t": 1, "v": [0.0, 1.0, 2.0]},
		              {"t": 2, "v": [1.0, 2.0, 4.0]}]
		var cubes2 = [{"t": 1, "v": [4.0, 1.0, 2.0]},
		              {"t": 2, "v": [9.0, 2.0, 4.0]}]

		var r1 = builder1.calculateCubeVertices(cubes1, 2, 2);
		var r2 = builder2.calculateCubeVertices(cubes2, 2, 2);
		deepEqual(r1.tCoords, r2.tCoords);
		notDeepEqual(r1.vertices, r2.vertices);

		var cubes3 = cubes1.concat(cubes2);
		var r3 = builder1.calculateCubeVertices(cubes3, 2, 2);
		equal(r1.vertices.length + r2.vertices.length, r3.vertices.length);
		equal(r1.indeces.length + r2.indeces.length, r3.indeces.length);
		equal(r1.tCoords.length + r2.tCoords.length, r3.tCoords.length);
		equal(r1.normals.length + r2.normals.length, r3.normals.length);
});
