require(["Timer", "SceneLoader", "GlFactory"]);

var Engine = function() {

    var self = this;
	var timer = new Timer();
    var MAX_FRAMESKIP = 5;
    self.pressed = {};
    self.scene = undefined;
    self.sceneLoader = new SceneLoader();

    self.initGLOnCanvasElement = function(canvasElement) {
        self.factory = GlFactory.initGLOnCanvasElement(canvasElement);
    }

    self.initGLOnCanvas = function(canvasId) {
        self.factory = GlFactory.initGLOnCanvas(canvas);
    }

    self.loadScene = function(resource) {
        self.sceneLoader.setFactory(self.factory);
        try {
            if (precompiledScenes && precompiledScenes[resource]) {
                return self.sceneLoader.buildSceneFromJSON(precompiledScenes[resource]);
            }
        } catch (e) {
            console.log("Could not use precompiled resource");
            console.log(e);
        }
        $.getJSON(resource, function(json) {
            self.sceneLoader.buildSceneFromJSON(json);
        })
    }

    self.startTicks = function() {
        self.bindEvents();
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
