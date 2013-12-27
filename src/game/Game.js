require(["engine.State", "game.Player", "game.GameModel"]);
var Game = new function() {
	var self = new State();
    var gameModel = new GameModel();
	var ui = self.engine.ui;
    var scene_initialized = false;

    var getPlayer = gameModel.getPlayer;

    self.tick = function(scene) {
        if (!scene_initialized) {
			ui.setStatus("RUN!");
            scene.clearColor(1.0, 1.0, 1.0, 1.0);
            scene_initialized = true;
        }
    }

	self.inputTick = function(scene, elapsed) {
        if(self.handleInput(scene)) { return; }
        
        gameModel.elapsedTime  += elapsed;
        var secondsPlayed = (gameModel.elapsedTime / 1000).toFixed(0);
		var p = getPlayer(scene);
        gameModel.secondsLeft   = 60 - secondsPlayed;
        gameModel.score         = Math.max(gameModel.score, p.position.position[0]);
        if (p.position.position[0] > 440) {
            gameModel.score += gameModel.secondsLeft * 10;
			self.stateMachine.changeToState("GAME_OVER", gameModel);
        }
        if (gameModel.secondsLeft <= 0) {
			self.stateMachine.changeToState("GAME_OVER", gameModel);
        }
        ui.setScore(gameModel.formatScore());
        ui.setTimeLeft(gameModel.formatSecondsLeft());
	}

    self.handleInput = function(scene) {
        if (self.engine.pressed[32]) { 
			var data = {"scene": scene, "model": gameModel};
			self.stateMachine.changeToState("RESTART", data);
			return true;
		}

        var p = getPlayer(scene);
        if      (self.engine.pressed[38]) { p.up();          } 
        if      (self.engine.pressed[37]) { p.right();       } 
        else if (self.engine.pressed[39]) { p.left();        } 
        else                         { p.movingX = 0.0; } 

        p.move(scene.namedEntities.world.positions);

        if (p.position.position[1] < -50.0) {
            var resetPosition = p.lastStandingPos ? p.lastStandingPos : p.startPosition;
            getPlayer(scene).resetPosition(playerPos);
        }
        self.cameraFollowsPlayer(scene, getPlayer(scene).position.position);
    }

    self.cameraFollowsPlayer = function(scene, playerPos) {
        var p = playerPos.slice(0);
        var c = scene.cameraStartPosition;
        scene.camera.position = [c[0] - p[0], c[1] - p[1], c[2]];
    }

    self.drawShapeCallback = function(scene, name, shape, player) {
        if (name == "player") {
            var xy = player.position.position;
            var sx = player.startPosition[0]
            var sy = player.startPosition[1] 
            scene.mm.translate([xy[0] - sx, xy[1] - sy, 0.0]);
        }
        scene.drawShape(shape);
    }
	return self;
}
