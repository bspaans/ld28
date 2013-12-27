require(["engine.State"]);
var LoadScene = function() {
	var self = new State();
	var ui = self.engine.ui

	self.activate = function(sceneLocation) {
        self.engine.loadScene(sceneLocation);
        self.engine.startTicks();
	}
	self.tick = function(scene) {
        ui.setStatus(self.engine.sceneLoader.getLoadStatus());
		if (scene) { self.stateMachine.changeToState("GAME", scene); }
	}
	return self;
}
