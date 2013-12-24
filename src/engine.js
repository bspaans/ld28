
require(["Engine", "GlShader", "GlScene", "GlTexture", "GlVertices"]);

var Position = function(pos) {
    var self = this;
    self.position = pos;
    self.moveX = function(d) {
        self.position[0] += d;
    }
    self.moveY = function(d) {
        self.position[1] += d;
    }
    self.moveZ = function(d) {
        self.position[2] += d;
    }
    return self;
}

var Player = function(player) {
    var self = this;
    self.player = player;
    self.position = new Position(player.json[0].v);
    self.startPosition = self.position.position.slice();
    self.speedX = 0.0;
    self.speedY = 0.0;
    self.topSpeedX = 0.6;
    self.topSpeedY = 0.7;
    self.jumping = false;
    self.jumptick = 0;
    self.lastStandingPos = undefined;

    self.movingX = 0.0;
    self.movingY = 0.0;

    self.resetPosition = function(pos) {
        self.position = new Position(pos.slice(0));
        self.speedX = 0.0;
        self.speedY = 0.0;
        self.jumping = false;
        self.jumptick = 0;
    }

    self.right = function() { self.movingX = 1; };
    self.left = function() { self.movingX = -1; };
    self.up = function() { self.movingY = 1; };

    self.interpolateMove = function(pos, interpolation) {
        var x = pos[0]+ self.speedX * interpolation 
        var y = pos[1]+ self.speedY * interpolation 
        return [x,y,pos[2]];
    }

    self.move = function(solids) {
        if (self.movingX == 1) {
            self.moveRight(solids);
        } else if (self.movingX == -1) {
            self.moveLeft(solids);
        } else {
            self.horizontalMomentum(solids);
        }
        if (self.movingY == 1) {
            self.jump(solids);
        } else {
            self.jumping = false;
        }
        self.gravity(solids);

        self.position.moveX(self.speedX)
        self.position.moveY(self.speedY);
    }

    self.isStanding = function(world) {
        var x = self.position.position[0] - 1;
        var y = self.position.position[1] - 1;
        var w = 2;
        var h = 2;
        for (var s in world) {
            var solid = world[s];
            var sx = solid[0];
            var sy = solid[1];
            var sw = solid[2];
            var sh = solid[3];
            if (x > sx - w && x < sx + sw) {
                if (y >= sy + 0.01 && y <= sy + sh + (1 / 8096)) {
                    self.position.position[1] = sy + sh + 1;
                    self.speedY = 0.0;
                    self.lastStandingPos = [sx + 1, sy + sh + 5, 0.0];
                    return true;
                }
            }
        }
        return false;
    }

    self.willBeStanding = function(world) {
        var x = self.position.position[0] - 1 + self.speedX;
        var y = self.position.position[1] - 1 + self.speedY ;
        var w = 2;
        var h = 2;
        for (var s in world) {
            var solid = world[s];
            var sx = solid[0];
            var sy = solid[1];
            var sw = solid[2];
            var sh = solid[3];
            if (x > sx - w && x < sx + sw) {
                if (y >= sy + 0.01 && y <= sy + sh + (1 / 8096)) {
                    self.position.position[1] = sy + sh + 1;
                    self.speedY = 0.0;
                    self.lastStandingPos = [sx + 1, sy + sh + 5, 0.0];
                    return true;
                }
            }
        }
        return false;
    }

    self.jump = function(world) {
        self.jumping = (self.jumping || self.isStanding(world)) && self.jumptick < 7;
        self.jumptick += 1;
        if (self.jumping) {
            self.speedY = self.topSpeedY; 
        } 
    }
    self.isFalling = function(world) {
        return !self.jumping && !self.isStanding(world);
    }
    self.canMoveHorizontally = function(world) {
        var x = self.position.position[0] - 1 + self.speedX;
        var y = self.position.position[1] - 1;
        var w = 2;
        var h = 2;
        for (var s in world) {
            var solid = world[s];
            var sx = solid[0];
            var sy = solid[1];
            var sw = solid[2];
            var sh = solid[3];
            if (x + w > sx  && x < sx + sw) {
                if (y >= sy - h && y < sy + sh) {
                    return false;
                }
            }
        }
        return true;
    }
    self.horizontalCollisionCorrection = function(world) {
        if (!self.canMoveHorizontally(world)) {
            self.speedX = 0.0;
        }
    }
    self.moveRight = function(world) {
        self.speedX = Math.max(-self.topSpeedX, self.speedX - 0.1);
        self.horizontalCollisionCorrection(world);
    }
    self.moveLeft = function(world) {
        self.speedX = Math.min(self.topSpeedX, self.speedX + 0.1);
        self.horizontalCollisionCorrection(world);
    }
    self.horizontalMomentum = function(world) {
        if (self.speedX < 0) {
            self.speedX = Math.min(0.0, self.speedX + 0.04);
        }
        else if (self.speedX > 0) {
            self.speedX = Math.max(0.0, self.speedX - 0.04);
        }
        self.horizontalCollisionCorrection(world);
    }

    self.gravity = function(world) {
        if (self.isFalling(world)) {
            self.jumptick = 0;
            self.movingY = 0.0;
            self.speedY = Math.max(-1 * (self.topSpeedY * 2), self.speedY - 0.2);
            self.willBeStanding(world);
        }
    }

    return self;
}

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

    audiojs.events.ready(function() {
        var options = {};
        self.soundtrack = audiojs.newInstance(document.getElementById("soundtrack"), options);
        $("#audio").hide();
        
    });

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
        if ((scene.finished || self.secondsLeft <= 0) && !self.currentlyPressedKeys[32]) {
            elem_fps.innerHTML       = "";
            elem_status.innerHTML    = "Press space to play again";
            elem_time_left.innerHTML = "GAME OVER";
            elem_score.innerHTML     = self.score.toFixed(0);
            return; 
        }
    }

    self.getPlayer = function(scene) {
        var p = scene.namedEntities.player;
        if (p instanceof Player) {
            return p;
        }
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
        if (self.currentlyPressedKeys[32]) {
            self.resetScene(scene, p.startPosition);
        }
        if (self.finished) { return; }
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
        if (self.secondsLeft >= 60) {
            var t = "1:00";
        } else if (self.secondsLeft < 10) {
            var t = "0:0" + self.secondsLeft;
        } else {
            var t = "0:" + self.secondsLeft;
        }
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
    new MyGame().start();

}
