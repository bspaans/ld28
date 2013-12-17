var SceneLoader = function() {

    var self = this;
    var sceneHasLoaded = false;

    self.getSceneIfReady = function() {
        if (sceneHasLoaded !== false) {
            if (sceneHasLoaded.texturesLoaded) { 
                return sceneHasLoaded;
            }
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

    self.buildSceneFromJSON = function(gl, json) {

        var shader = new GlShader(gl, json.vertexShader, json.fragmentShader);
        var scene = new GlScene(gl, shader);
        var glTexture = new GlTexture(gl, json.texture, scene);
        var cubes = new GlVertices(gl, glTexture);
        var textures = [];
        var shaderPrograms = [];
        var positions = [];
        var cubePositions = [];
        var normals = [];
            
        for (var i = 0 ; i < json.cubes.length; i++) {
            var cube = json.cubes[i];
            textures.push(cube.t);
            shaderPrograms.push(cube.s);
            positions = positions.concat(cube.v);
            normals = normals.concat(cubes.baseVertexNormals);
            if (cube.v[2] == 0.0) {
                cubePositions.push([cube.v[0] - 1, cube.v[1] - 1, 2, 2]);
            }
        }

        var texture = textureCoordArray(cubes.baseCubeTextureCoords, textures, 
                json.texturesPerRow, json.texturesPerColumn);
        var vertices = translatedBaseCopies(cubes.baseCube, positions);
        var nr = json.cubes.length;
        var indeces = arrayFromInterval(cubes.baseCubeIndeces, nr, 24);
        var textureCoords = [];
        for (var i = 0; i < nr ; i++) {
             textureCoords = texture.concat(textureCoords);
        }
        cubes.setVertices(vertices, indeces, textureCoords, normals);

        scene.addShape(cubes);
        scene.setSolids(cubePositions);
        scene.setCameraPosition(json.camera);
        scene.ambientColor = json.light.ambient;
        scene.lightingDirection = json.light.direction;
        scene.directionalColor = json.light.directionalColor;

        // player
        var player = new GlVertices(gl, glTexture);
        var vertices = translatedBaseCopies(cubes.baseCube, json.player.pos);

        shaderPrograms.push(json.player.s);
        positions = positions.concat(json.player.v);
        var texture = textureCoordArray(cubes.baseCubeTextureCoords, [json.player.t],
                json.texturesPerRow, json.texturesPerColumn);
        player.setVertices(vertices, player.baseCubeIndeces, texture, player.baseVertexNormals);
        player.position = json.player.pos;

        scene.setPlayer(player);
        sceneHasLoaded = scene;
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
