require(["engine.State"]);

var GameOver = function() {
    var self = new State();
    var ui = self.engine.ui;
    var gameModel = undefined;

    self.activate = function(data) { gameModel = data; }

    self.tick = function(scene) {
        ui.setFPS("");
        ui.setStatus("Press space to play again");
        ui.setTimeLeft("GAME OVER");
        ui.setScore(gameModel ? gameModel.formatScore() : 0);
    }

    self.inputTick = function(scene, elapsed) {
        if (self.engine.pressed[32]) { 
			var data = {"scene": scene, "model": gameModel};
            self.stateMachine.changeToState("RESTART", data);
        }
    }
    return self;
}
