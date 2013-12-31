require(["engine.Timer", "engine.SceneLoader", "engine.StateMachine", "gl.GlFactory"]);

var Engine = function() {

    var self = this;
	var timer = new Timer();
    var MAX_FRAMESKIP = 5;
    self.pressed = {};
    self.scene = undefined;
    self.sceneLoader = new SceneLoader();
    self.stateMachine = new StateMachine(self);

    self.initGLOnCanvasElement = function(canvasElement) {
        self.factory = GlFactory.initGLOnCanvasElement(canvasElement);
    }

    self.initGLOnCanvas = function(canvasId) {
        self.factory = GlFactory.initGLOnCanvas(canvasId);
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
    self.addState = self.stateMachine.addState;
    self.changeToState = self.stateMachine.changeToState;
    self.getCurrentState = self.stateMachine.getCurrentState;
    self.engineTick = function() {
        var scene = self.sceneLoader.getSceneIfReady();
        self.getCurrentState().tick(scene);
        self.inputLoop(scene);
        self.draw(scene);
    }

    self.inputLoop = function(scene) {
        var elapsed = timer.getElapsedTime();
        var now = timer.now();
        var loops = 0;
        while (timer.isLaterThanNextTick(now) && loops < MAX_FRAMESKIP) {
            // TODO what is elapsed doing?
            self.getCurrentState().inputTick(scene, elapsed); 
			timer.calculateNextTick();
			loops++;
        }
    }

    self.drawShapeCallback = function(scene, name, shape, entityRef) {
        var g = self.getCurrentState(); if (!g) return;
        if (g.drawShapeCallback) {
            g.drawShapeCallback(scene, name, shape, entityRef);
        } else {
            scene.drawShape(shape);
        }
    }
    self.draw = function(scene) {
        if (!scene) return;
        scene.draw( -timer.getPlaceInFrame(), self.drawShapeCallback);
    }
    
    self.onkeydown  = function(event) { self.pressed[event.keyCode] = true; }
    self.onkeyup    = function(event) { self.pressed[event.keyCode] = false; }
	self.bindEvents = function() {
		["onkeydown", "onkeyup"].map(function(e) { document[e] = self[e]; });
	}
    return self;
}
