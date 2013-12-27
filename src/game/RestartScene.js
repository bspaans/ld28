require(["engine.State"]);

var RestartScene = function() {
    var self = new State();

    self.activate = function(data) {
		data.model.resetScene(data.scene);
		self.stateMachine.changeToState("GAME", data.scene);
    }
	return self;
}
