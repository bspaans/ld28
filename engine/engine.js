
require(["Engine", "GlShader", "GlScene", "GlTexture", "GlVertices"]);

var MyGame = function() {
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

    self.start = function() {
        try { 
            gl = self.initGLOnCanvas("lesson01-canvas");
        } catch(e) {
            console.log(e);
            elem_status.innerHTML = "Could not load OpenGL";
            return;
        }
        self.loadScene("resources/scene.json");
        self.firstTick();
    }

    self.preTick = function(scene) {
        elem_status.innerHTML = self.sceneLoader.getLoadStatus();
        if (!scene) return;
        if ((scene.finished || scene.secondsLeft <= 0) && !self.currentlyPressedKeys[32]) {
            elem_fps.innerHTML       = "";
            elem_status.innerHTML    = "Press space to play again";
            elem_time_left.innerHTML = "GAME OVER";
            elem_score.innerHTML     = self.score.toFixed(0);
            return; 
        }
    }

    self.resetScene = function(scene, playerPos) {
        scene.player.resetPosition(playerPos);
        if (playerPos == scene.player.startPosition) {
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
        var p = scene.player;
        if (self.currentlyPressedKeys[32]) {
            self.resetScene(scene, p.startPosition);
        }
        if (self.currentlyPressedKeys[37]) { 
            p.right();
        } else if (self.currentlyPressedKeys[39]) { 
            p.left();
        } else {
            p.movingX = 0.0;
        }
        if (self.currentlyPressedKeys[38]) { 
            p.up();
        } 

        p.move(scene.solids);

        if (scene.player.position.position[1] < -50.0) {
            var p = scene.player;
            var resetPosition = p.lastStandingPos ? p.lastStandingPos : p.startPosition;
            self.resetScene(scene, resetPosition);
        }
    }

    self.inputTick = function(scene, elapsed) {
        if (!scene) return;
        self.elapsedTime  += elapsed;
        self.secondsPlayed = (self.elapsedTime / 1000).toFixed(0);
        self.secondsLeft   = 60 - self.secondsPlayed;
        self.score         = Math.max(self.score, scene.player.position.position[0]);
        self.handleInput(scene);
        if (scene.player.position.position[0] > 440) {
            self.finished = true;
            self.score += self.secondsLeft * 10;
            self.secondsLeft = 0;
            return;
        }
        if (self.secondsLeft <= 0) {
            return;
        }
    }

    self.postTick = function(scene) {
        if (!scene) return;
        if (self.secondsLeft >= 60) {
            var t = "1:00";
        } else if (scene.secondsLeft < 10) {
            var t = "0:0" + self.secondsLeft;
        } else {
            var t = "0:" + self.secondsLeft;
        }
        elem_score.innerHTML = self.score.toFixed(0);
        elem_time_left.innerHTML = t;
        self.cameraFollowsPlayer(scene, scene.player.position.position);
    }

    return self;
}

function webGLStart() {
    new MyGame().start();

}
