var Engine = function() {

    var TICKS_PER_SECOND = 30;
    var MS_PER_FRAME = 1000 / TICKS_PER_SECOND;
    var MAX_FRAMESKIP = 5;
    var lastTime = 0; 
    var nextTick = new Date().getTime() + MS_PER_FRAME;

    var self = this;
    self.currentlyPressedKeys = {};
    self.scene = undefined;
    self.sceneLoader = new SceneLoader();

    self.initGLOnCanvasElement = function(canvasElement) {
        try {
            self.gl = canvasElement.getContext("experimental-webgl");
        } catch (e) { console.log(e) }
        if (!self.gl) {
            throw "WebGL Initialization error"
        }
        self.gl.viewportWidth = canvasElement.width;
        self.gl.viewportHeight = canvasElement.height;
        return self.gl;
    }
    self.initGLOnCanvas = function(canvasId) {
        var canvas = document.getElementById(canvasId);
        if (canvas == null) {
            throw "Can't find canvas with id " + canvasId;
        }
        return self.initGLOnCanvasElement(canvas);
    }

    self.firstTick = function() {
        self.bindEvents();
        self.gl.clearColor(1.0, 1.0, 1.0, 1.0);
        self.gl.enable(gl.DEPTH_TEST);
        self.tick();
    }

    self.getElapsedTime = function() {
        var timeNow = new Date().getTime();
        if (lastTime == 0) { 
            lastTime = timeNow;
            return 1;
        }
        var elapsed = timeNow - lastTime;
        lastTime = timeNow;
        return elapsed;
    }

    self.inputLoop = function(scene) {
        var elapsed = self.getElapsedTime();
        var now = new Date().getTime();
        var loops = 0;
        while ( now > nextTick && loops < MAX_FRAMESKIP) {
            self.inputTick(scene, elapsed);
            nextTick += MS_PER_FRAME;
        }
    }
    self.preTick = function(scene) { } 
    self.postTick = function(scene) { }
    self.engineTick = function() {
        var scene = self.sceneLoader.getSceneIfReady();
        self.preTick(scene);
        self.inputLoop(scene);
        self.postTick(scene);
        self.draw(scene);
    }

    self.draw = function(scene) {
        if (!scene) return;
        var now = new Date().getTime();
        var placeInFrame = now + MS_PER_FRAME - nextTick;
        scene.draw( -placeInFrame / MS_PER_FRAME );
    }

    self.tick = function() {
        window.requestAnimationFrame(self.tick);
        self.engineTick();
    }

    self.loadScene = function(resource) {
        $.getJSON(resource, function(json) {
            self.sceneLoader.buildSceneFromJSON(self.gl, json);
        })
    }

    self.bindEvents = function() {
        document.onkeydown = self.handleKeyDown;
        document.onkeyup = self.handleKeyUp;
    }
    self.handleKeyDown = function(event) {
        self.currentlyPressedKeys[event.keyCode] = true;
    }
    self.handleKeyUp = function(event) {
        self.currentlyPressedKeys[event.keyCode] = false;
    }

    // Override these 
    self.preTick = undefined;
    self.postTick = undefined;

    return self;
}
