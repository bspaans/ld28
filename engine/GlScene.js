require(["GlMatrixManager"])
require(["Camera"]);

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
    self.position = new Position(player.position);
    self.startPosition = player.position.slice(0);
    self.speedX = 0.0;
    self.speedY = 0.0;
    self.topSpeedX = 0.5;
    self.topSpeedY = 0.6;
    self.jumping = false;
    self.jumptick = 0;

    self.resetPosition = function() {
        self.position = new Position(self.startPosition.slice(0));
        self.speedX = 0.0;
        self.speedY = 0.0;
        self.jumping = false;
        self.jumptick = 0;
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
                if (y >= sy + (sh / 2) && y <= sy + sh + (1 / 8096)) {
                    self.position.position[1] = sy + sh + 1;
                    self.speedY = 0.0;
                    return true;
                }
            }
        }
        return false;
    }
    self.jump = function(world, elapsed) {
        self.jumping = (self.jumping || self.isStanding(world)) && self.jumptick < 7;
        self.jumptick += elapsed;
        if (self.jumping) {
            if (self.speedY < 0) { self.speedY = 0.5}
            self.speedY = self.topSpeedY * elapsed; 
            self.position.moveY(self.speedY);
        } 
    }
    self.stopJumping = function() {
        self.jumping = false;
        self.jumptick = 0;
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
    self.moveRight = function(world, elapsed) {
        self.speedX = Math.max(-self.topSpeedX, self.speedX - 0.1 * elapsed);
        self.horizontalCollisionCorrection(world);
    }
    self.moveLeft = function(world, elapsed) {
        self.speedX = Math.min(self.topSpeedX, self.speedX + 0.1 * elapsed);
        self.horizontalCollisionCorrection(world);
    }
    self.horizontalMomentum = function(world, elapsed) {
        if (self.speedX < 0) {
            self.speedX = Math.min(0.0, self.speedX + 0.04 * elapsed);
        }
        else if (self.speedX > 0) {
            self.speedX = Math.max(0.0, self.speedX - 0.04 * elapsed);
        }
        self.horizontalCollisionCorrection(world);
    }

    self.gravity = function(world, elapsed) {
        if (self.isFalling(world)) {
            if (self.speedY >= 0) { self.speedY = -0.3; }
            self.speedY = Math.max(-1 * (self.topSpeedY * 2), self.speedY - 0.03 * elapsed);
            self.position.moveY(self.speedY);
        }
    }

    return self;
}

var GlScene = function(gl, shader) {

    var self = this;
    
    self.gl = gl;
    self.mm = new GlMatrixManager();
    self.camera = new Camera();
    self.cameraStartPosition = undefined;
    self.shapes = [];
    self.framesPerSecond = 0;
    self.ticks = 0;
    self.score = 0;
    self.shader = shader;
    self.player = undefined;
    self.solids = [];
    self.texturesLoaded = false;
    self.elapsedTime = 0;
    self.finished = false;

    self.ambientColor = undefined;
    self.lightingDirection = undefined;
    self.directionalColor = undefined;

    audiojs.events.ready(function() {
        var options = {};
        self.soundtrack = audiojs.newInstance(document.getElementById("soundtrack"), options);
        $("#audio").hide();
        
    });

    self.setCameraPosition = function(pos) {
        self.camera.position = pos;
        self.cameraStartPosition = pos.slice(0);
    }

    self.setPlayer = function(p) {
        self.player = new Player(p);
        self.addShape(p);
    }

    self.setSolids = function(s) {
        self.solids = s;
    }

    self.addShape = function(shape) {
        self.shapes.push(shape);
    }

    self.resetScene = function() {
        self.player.resetPosition();
        self.elapsedTime = 0;
        self.ticks = 0;
        self.camera.position = self.cameraStartPosition.slice(0);
        self.finished = false;
    }

    self.tick = function(elapsed, elapsedFrames, currentlyPressedKeys) {
        var current = 1.0 / (elapsed / 1000)
        self.ticks++;
        self.elapsedTime += elapsed;
        self.framesPerSecond = self.framesPerSecond * 0.1 + current * 0.9;
        self.secondsPlayed = (self.elapsedTime / 1000).toFixed(0);
        self.secondsLeft = 60 - self.secondsPlayed;
        self.handleInput(currentlyPressedKeys, elapsedFrames);
        self.score = Math.max(self.score, self.player.position.position[0]);
        if (self.player.position.position[0] > 276) {
            self.finished = true;
            return;
        }
        if (self.secondsLeft <= 0) {
            self.resetScene();
        }
        self.draw();
    }

    self.handleInput = function(currentlyPressedKeys, elapsed) {
        if (currentlyPressedKeys[37]) { // left
            self.player.moveRight(self.solids, elapsed);
        } else if (currentlyPressedKeys[39]) { // right
            self.player.moveLeft(self.solids, elapsed);
        } else {
            self.player.horizontalMomentum(self.solids, elapsed);
        }
        self.camera.moveX(self.player.speedX);
        self.camera.moveY(self.player.speedY / 2);
        self.player.position.moveX(self.player.speedX);
        if (currentlyPressedKeys[38]) { // up
            self.player.jump(self.solids, elapsed);
        } else {
            self.player.stopJumping(elapsed);
        }

        self.player.gravity(self.solids, elapsed);

        if (self.player.position.position[1] < -40.0) {
            self.resetScene();
        }
    }

    self.draw = function() {
        self.gl.viewport(0, 0, self.gl.viewportWidth, self.gl.viewportHeight);
        self.gl.clear(self.gl.COLOR_BUFFER_BIT | self.gl.DEPTH_BUFFER_BIT);
        self.mm.resetPerspective();
        self.camera.setGlPerspective(self.gl, self.shader);
        self.drawShapes();
    }

    self.drawShapes = function() {
        for (var i in self.shapes) {
            if (self.shapes[i] === self.player.player) {
                self.mm.mvPushMatrix();
                var x = self.player.position.position[0]
                var y = self.player.position.position[1]
                var sx = self.player.startPosition[0]
                var sy = self.player.startPosition[1]
                self.mm.translate([x - sx, y - sy, 0.0]);
                self.mm.setMatrixUniforms(self.gl, self.shader); 
                self.shapes[i].draw(self.shader, self.ambientColor, self.lightingDirection, self.directionalColor);
                self.mm.mvPopMatrix();
            } else {
                self.mm.setMatrixUniforms(self.gl, self.shader); 
                self.shapes[i].draw(self.shader, self.ambientColor, self.lightingDirection, self.directionalColor);
            }
        }
    }

    return self;
}
