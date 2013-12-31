var GameModel = function() {

    self.score       = 0;
    self.elapsedTime = 0;
    self.secondsLeft = 60;

	self.formatSecondsLeft = function() {
		var left = self.secondsLeft;
        if      (left >= 60) { return "1:00"; } 
		else if (left  < 10) { return "0:0" + left; } 
		else if (left <=  0) { return "0:00" } 
		return "0:"  + left; 
	}

	self.formatScore = function() {
		return self.score.toFixed(0);
	}

	self.reset = function() {
		self.elapsedTime = 0;
		self.score       = 0;
		self.secondsLeft = 60;
	}

    self.getPlayer = function(scene) {
        var p = scene.namedEntities.player;
        if (p instanceof Player) { return p; }
        scene.namedEntities.player = new Player(scene.namedEntities.player);
        return scene.namedEntities.player;
    }

    self.resetScene = function(scene) {
        var p = self.getPlayer(scene);
        p.resetPosition(p.startPosition);
        self.reset();
    }
    return self;
}
