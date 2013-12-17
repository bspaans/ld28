
require(["Engine", "GlShader", "GlScene", "GlTexture", "GlVertices"]);

var MyGame = function() {
    var self = new Engine();
    var elem_fps       = document.getElementById("fps");
    var elem_status    = document.getElementById("status");
    var elem_time_left = document.getElementById("time");
    var elem_score     = document.getElementById("score");

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
            elem_score.innerHTML     = scene.score.toFixed(0);
            return; 
        }
    }

    self.postTick = function(scene) {
        if (!scene) return;
        if (scene.secondsLeft >= 60) {
            var t = "1:00";
        } else if (scene.secondsLeft < 10) {
            var t = "0:0" + scene.secondsLeft;
        } else {
            var t = "0:" + scene.secondsLeft;
        }
        elem_score.innerHTML = scene.score.toFixed(0);
        elem_time_left.innerHTML = t;
    }

    return self;
}

function webGLStart() {
    new MyGame().start();

}
