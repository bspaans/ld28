require(["engine.Engine", "game.Player"]);

var OneMinuteMan = function() {
    var self = new Engine();
    var elem_fps       = document.getElementById("fps");
    var elem_status    = document.getElementById("status");
    var elem_time_left = document.getElementById("time");
    var elem_score     = document.getElementById("score");

    self.ticks       = 0;
    self.score       = 0;
    self.elapsedTime = 0;
    self.finished    = false;
    self.secondsLeft = 60;

    var scene_initialized = false;

    audiojs.events.ready(function() {
        var options = {};
        self.soundtrack = audiojs.newInstance(document.getElementById("soundtrack"), options);
        $("#audio").hide();
        
    });

    self.start = function() {
        try { 
            self.initGLOnCanvas("lesson01-canvas");
        } catch(e) {
            console.log(e);
            elem_status.innerHTML = "Could not load OpenGL";
            return;
        }
        self.loadScene("resources/scene.json");
        self.startTicks();
    }

    self.preTick = function(scene) {
        elem_status.innerHTML = self.sceneLoader.getLoadStatus();
        if (!scene) return;
        if (!scene_initialized) {
            scene.clearColor(1.0, 1.0, 1.0, 1.0);
            scene_initialized = true;
        }
        if ((scene.finished || self.secondsLeft <= 0) && !self.pressed[32]) {
            elem_fps.innerHTML       = "";
            elem_status.innerHTML    = "Press space to play again";
            elem_time_left.innerHTML = "GAME OVER";
            elem_score.innerHTML     = self.score.toFixed(0);
            return; 
        }
    }

    self.getPlayer = function(scene) {
        var p = scene.namedEntities.player;
        if (p instanceof Player) { return p; }
        scene.namedEntities.player = new Player(scene.namedEntities.player);
        return scene.namedEntities.player;
    }

    self.resetScene = function(scene, playerPos) {
        self.getPlayer(scene).resetPosition(playerPos);
        if (playerPos == self.getPlayer(scene).startPosition) {
            self.elapsedTime = 0;
            self.score = 0;
        }
        self.finished = false;
    }

    self.cameraFollowsPlayer = function(scene, playerPos) {
        var p = playerPos.slice(0);
        var c = scene.cameraStartPosition;
        scene.camera.position = [c[0] - p[0], c[1] - p[1], c[2]];
    }

    self.handleInput = function(scene) {
        var p = self.getPlayer(scene);
        if      (self.pressed[32]) { self.resetScene(scene, p.startPosition); }
        if      (self.finished)    { return; }

        if      (self.pressed[38]) { p.up();          } 
        if      (self.pressed[37]) { p.right();       } 
        else if (self.pressed[39]) { p.left();        } 
        else                       { p.movingX = 0.0; } 

        p.move(scene.namedEntities.world.positions);

        if (p.position.position[1] < -50.0) {
            var resetPosition = p.lastStandingPos ? p.lastStandingPos : p.startPosition;
            self.resetScene(scene, resetPosition);
        }
    }

    self.inputTick = function(scene, elapsed) {
        if (!scene) return;
        self.handleInput(scene);
        
        if (self.finished) return;
        self.elapsedTime  += elapsed;
        self.secondsPlayed = (self.elapsedTime / 1000).toFixed(0);
        self.secondsLeft   = 60 - self.secondsPlayed;
        self.score         = Math.max(self.score, self.getPlayer(scene).position.position[0]);
        if (self.getPlayer(scene).position.position[0] > 440) {
            self.finished = true;
            self.score += self.secondsLeft * 10;
            self.secondsLeft = 0;
            return;
        }
        if (self.secondsLeft <= 0) {
            self.finished = true;
            return;
        }
    }

    self.postTick = function(scene) {
        if (!scene) return;
        if      (self.secondsLeft >= 60) { var t = "1:00"; } 
		else if (self.secondsLeft  < 10) { var t = "0:0" + self.secondsLeft; } 
		else                             { var t = "0:"  + self.secondsLeft; }
        elem_score.innerHTML = self.score.toFixed(0);
        elem_time_left.innerHTML = t;
        self.cameraFollowsPlayer(scene, self.getPlayer(scene).position.position);
    }

    self.drawDynamicShapeCallback = function(scene, name, shape, player) {
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

function webGLStart() {
    new OneMinuteMan().start();
}
