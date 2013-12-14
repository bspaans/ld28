
require(["GlShader", "GlScene", "GlTexture", "GlVertices"]);


var lastTime = 0;
var sceneHasLoaded = false;
var currentlyPressedKeys = {};

function initGL(canvas) {
    try {
        gl = canvas.getContext("experimental-webgl");
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    } catch (e) { }
    if (!gl) {
        throw "Could not initialise WebGL, sorry :-(";
    }
    document.onkeydown = handleKeyDown;
    document.onkeyup = handleKeyUp;
    return gl;
}

function handleKeyDown(event) {
    currentlyPressedKeys[event.keyCode] = true;
}

function handleKeyUp(event) {
    currentlyPressedKeys[event.keyCode] = false;
}

function getElapsedTime() {
    var timeNow = new Date().getTime();
    var elapsed = timeNow - lastTime;
    lastTime = timeNow;
    return elapsed;
}


function tick() {
    window.requestAnimationFrame(function () { tick(); });
    if (sceneHasLoaded !== false) {
        if (sceneHasLoaded.texturesLoaded) { 
            var scene = sceneHasLoaded;
        } else {
            fps.innerHTML = "Loading textures";
            return;
        }
    } else { 
        fps.innerHTML = "Scene has not loaded";
        return; 
    }
    var elapsed = getElapsedTime();
    scene.tick(elapsed, currentlyPressedKeys);
    if (scene.ticks % 20 == 0) {
        fps.innerHTML = scene.framesPerSecond.toFixed(2);
    }
}

function webGLStart() {
    var canvas = document.getElementById("lesson01-canvas");
    fps = document.getElementById("fps");
    var gl = initGL(canvas);
    loadScene("resources/scene.json");

    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    tick();
}

var loadScene = function(resource) {
    $.getJSON(resource, function(json) {
        buildSceneFromJSON(json);
    })
}


var buildSceneFromJSON = function(json) {

    var shader = new GlShader(gl, json.vertexShader, json.fragmentShader);
    var scene = new GlScene(gl, shader);
    var glTexture = new GlTexture(gl, json.texture, scene);
    var cubes = new GlVertices(gl, glTexture);
    var textures = [];
    var shaderPrograms = [];
    var positions = [];
    var cubePositions = []
        
    for (var i = 0 ; i < json.cubes.length; i++) {
        var cube = json.cubes[i];
        textures.push(cube.t);
        shaderPrograms.push(cube.s);
        positions = positions.concat(cube.v);
        cubePositions.push([cube.v[0] - 1, cube.v[1] - 1, 2, 2]);
    }

    var texture = textureCoordArray(cubes.baseCubeTextureCoords, textures, 
            json.texturesPerRow, json.texturesPerColumn);
    console.log(texture.length);
    var vertices = translatedBaseCopies(cubes.baseCube, positions);
    var nr = json.cubes.length;
    var indeces = arrayFromInterval(cubes.baseCubeIndeces, nr, 24);
    var textureCoords = [];
    for (var i = 0; i < nr ; i++) {
         textureCoords = texture.concat(textureCoords);
    }
    console.log(textureCoords.length);
    cubes.setVertices(vertices, indeces, textureCoords);

    scene.addShape(cubes);
    scene.setSolids(cubePositions);
    scene.setCameraPosition(json.camera);

    // player
    var player = new GlVertices(gl, glTexture);
    var vertices = translatedBaseCopies(cubes.baseCube, json.player.pos);

    textures.push(json.player.t);
    shaderPrograms.push(json.player.s);
    positions = positions.concat(json.player.v);
    var texture = textureCoordArray(cubes.baseCubeTextureCoords, [json.player.t],
            json.texturesPerRow, json.texturesPerColumn);
    player.setVertices(vertices, player.baseCubeIndeces, texture);
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

var arrayFromPositionsVer3 = function(base, arr) {
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
