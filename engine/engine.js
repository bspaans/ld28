
require(["GlShader", "GlScene", "GlTexture", "GlVertices"]);


var lastTime = 0;

function initGL(canvas) {
    try {
        gl = canvas.getContext("experimental-webgl");
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    } catch (e) { }
    if (!gl) {
        throw "Could not initialise WebGL, sorry :-(";
    }
    return gl;
}

function getElapsedTime() {
    var timeNow = new Date().getTime();
    var elapsed = timeNow - lastTime;
    lastTime = timeNow;
    return elapsed;
}


function tick(scene, shader) {
    window.requestAnimationFrame(function () { tick(scene, shader); });
    var elapsed = getElapsedTime();
    scene.tick(elapsed);
    scene.draw(shader);
    if (scene.ticks % 20 == 0) {
        fps.innerHTML = scene.framesPerSecond.toFixed(2);
    }
}

function webGLStart() {
    var canvas = document.getElementById("lesson01-canvas");
    fps = document.getElementById("fps");
    var gl = initGL(canvas);
    var shader = new GlShader(gl, "texture-shader-vs", "texture-shader-fs");
    var scene = initScene(gl);

    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    tick(scene, shader);
}

function initScene(gl) {

    var scene = new GlScene(gl);
    var cubes = new GlVertices(gl, new GlTexture(gl, "resources/tiles.gif"));
    var texture = textureCoordArray(cubes.baseCubeTextureCoords, 
            [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 2, 2);

    var positions = translatedBaseCopies(cubes.baseCube, 
            [0.0, 0.0, 0.0,
             2.0, 0.0, -2.0,
             0.0, 0.0, -2.0,
             2.0, 2.0, -2.0,
             
             6.0, 0.0, 0.0,
             6.0, 0.0,-2.0,
             8.0, 0.0,-2.0,
             8.0, 2.0,-2.0,

             8.0, 2.0,-4.0,
             8.0, 2.0,-6.0,
             6.0, 2.0,-6.0,
             4.0, 2.0,-6.0,
             2.0, 2.0,-6.0,
             2.0, 2.0,-4.0,

             0.0, -2.0, 0.0,
             0.0, -4.0, 0.0,
             0.0, -6.0, 0.0,
             0.0, -8.0, 0.0,

             6.0, -2.0, 0.0,
             6.0, -4.0, 0.0,
             6.0, -6.0, 0.0,
             6.0, -8.0, 0.0,

             2.0, -4.0, 0.0,
             4.0, -4.0, 0.0,
             2.0, -8.0, 0.0,
             4.0, -8.0, 0.0,
             8.0, -8.0, 0.0,
             10.0, -8.0, 0.0,
             8.0, -10.0, -2.0,
             8.0, -12.0, -2.0,
             ]);
    var nr = positions.length / 72;
    var indeces = arrayFromInterval(cubes.baseCubeIndeces, nr, 24);
    var textureCoords = [];
    for (var i = 0; i < nr ; i++) {
         textureCoords = texture.concat(textureCoords);
    }
    cubes.setVertices(positions, indeces, textureCoords);

    scene.addShape(cubes);
    return scene;
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