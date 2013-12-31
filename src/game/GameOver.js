require(["engine.State"]);

var GameOver = function() {
    var self = new State();
    var gameModel = undefined;

    self.activate = function(data) { gameModel = data; }

    self.tick = function(scene) {
        self.engine.ui.setFPS("");
        self.engine.ui.setStatus("Press space to play again");
        self.engine.ui.setTimeLeft("GAME OVER");
        self.engine.ui.setScore(gameModel ? gameModel.formatScore() : 0);
    }

    self.inputTick = function(scene, elapsed) {
        if (self.engine.pressed[32]) { 
			var data = {"scene": scene, "model": gameModel};
            self.stateMachine.changeToState("RESTART", data);
        }
    }
    return self;
}
