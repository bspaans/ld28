require(["Timer", "SceneLoader"]);

var Engine = function() {

    var self = this;
	var timer = new Timer();
    var MAX_FRAMESKIP = 5;
    self.pressed = {};
    self.scene = undefined;
    self.sceneLoader = new SceneLoader(self);

    self.initGLOnCanvasElement = function(canvasElement) {
        try { self.gl = canvasElement.getContext("experimental-webgl"); } 
		catch (e) { console.log(e) }

        if (!self.gl) { throw "WebGL Initialization error" }
        self.gl.viewportWidth  = canvasElement.width;
        self.gl.viewportHeight = canvasElement.height;
        return self.gl;
    }

    self.initGLOnCanvas = function(canvasId) {
        var canvas = document.getElementById(canvasId);
        if (canvas == null) { throw "Can't find canvas with id " + canvasId; }
        return self.initGLOnCanvasElement(canvas);
    }

    self.loadScene = function(resource) {
        if (precompiledScenes && precompiledScenes[resource]) {
            return self.sceneLoader.buildSceneFromJSON(self.gl, precompiledScenes[resource]);
        }
        $.getJSON(resource, function(json) {
            self.sceneLoader.buildSceneFromJSON(self.gl, json);
        })
    }

    self.firstTick = function() {
        self.bindEvents();
        self.gl.clearColor(1.0, 1.0, 1.0, 1.0);
        self.gl.enable(gl.DEPTH_TEST);
        self.tick();
    }

    self.tick = function() {
        window.requestAnimationFrame(self.tick);
        self.engineTick();
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

    self.inputLoop = function(scene) {
        var elapsed = timer.getElapsedTime();
        var now = timer.now();
        var loops = 0;
        while (timer.isLaterThanNextTick(now) && loops < MAX_FRAMESKIP) {
            self.inputTick(scene, elapsed); // TODO what is elapsed doing?
			timer.calculateNextTick();
			loops++;
        }
    }

    self.drawDynamicShapeCallback = undefined;
    self.draw = function(scene) {
        if (!scene) return;
        scene.draw( -timer.getPlaceInFrame(), self.drawDynamicShapeCallback);
    }
    
    self.onkeydown  = function(event) { self.pressed[event.keyCode] = true; }
    self.onkeyup    = function(event) { self.pressed[event.keyCode] = false; }
	self.bindEvents = function() {
		["onkeydown", "onkeyup"].map(function(e) { document[e] = self[e]; });
	}
    return self;
}
