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
