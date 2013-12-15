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
    self.topSpeedX = 0.6;
    self.topSpeedY = 0.6;
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
                if (y >= sy + (sh / 2) && y <= sy + sh + (1 / 8096)) {
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
            if (self.speedY < 0) { self.speedY = 0.5}
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
            if (self.speedY >= 0) { self.speedY = -0.3; }
            self.speedY = Math.max(-1 * (self.topSpeedY * 2), self.speedY - 0.03);
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
    self.secondsLeft = 60;

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
        self.cameraFollowsPlayer(p.position);
        self.addShape(p);
    }

    self.setSolids = function(s) {
        self.solids = s;
    }

    self.addShape = function(shape) {
        self.shapes.push(shape);
    }

    self.resetScene = function(playerPos) {
        self.player.resetPosition(playerPos);
        if (playerPos == self.player.startPosition) {
            self.elapsedTime = 0;
            self.ticks = 0;
            self.score = 0;
        }
        self.cameraFollowsPlayer(playerPos);
        self.finished = false;
    }

    self.cameraFollowsPlayer = function(playerPos) {
        var p = playerPos.slice(0);
        var c = self.cameraStartPosition;
        self.camera.position = [c[0] - p[0], c[1] - p[1], c[2]];
    }

    self.tick = function(elapsed, currentlyPressedKeys) {
        var current = 1.0 / (elapsed / 1000)
        self.ticks++;
        self.elapsedTime += elapsed;
        //self.framesPerSecond = self.framesPerSecond * 0.1 + current * 0.9;
        self.secondsPlayed = (self.elapsedTime / 1000).toFixed(0);
        self.secondsLeft = 60 - self.secondsPlayed;
        self.handleInput(currentlyPressedKeys);
        self.score = Math.max(self.score, self.player.position.position[0]);
        if (self.player.position.position[0] > 440) {
            self.finished = true;
            self.score += self.secondsLeft * 10;
            self.secondsLeft = 0;
            return;
        }
        if (self.secondsLeft <= 0) {
            return;
        }
    }

    self.handleInput = function(currentlyPressedKeys) {
        if (currentlyPressedKeys[32]) {
            self.resetScene(self.player.startPosition);
        }
        if (currentlyPressedKeys[37]) { 
            self.player.right();
        } else if (currentlyPressedKeys[39]) { 
            self.player.left();
        } else {
            self.player.movingX = 0.0;
        }
        if (currentlyPressedKeys[38]) { 
            self.player.up();
        } 

        self.player.move(self.solids);

        if (self.player.position.position[1] < -50.0) {
            self.resetScene(self.player.lastStandingPos);
        }
    }

    self.draw = function(interpolation) {
        self.gl.viewport(0, 0, self.gl.viewportWidth, self.gl.viewportHeight);
        self.gl.clear(self.gl.COLOR_BUFFER_BIT | self.gl.DEPTH_BUFFER_BIT);
        self.mm.resetPerspective();
        var cy = self.player.interpolateMove(self.player.position.position, interpolation);
        self.cameraFollowsPlayer(self.player.position.position);
        self.camera.setGlPerspective(self.gl, self.shader);
        self.drawShapes(interpolation);
    }

    self.drawShapes = function(interpolation) {
        for (var i in self.shapes) {
            if (self.shapes[i] === self.player.player) {
                self.mm.mvPushMatrix();
                var xy = self.player.position.position //self.player.interpolateMove(self.player.position.position, interpolation);
                var sx = self.player.startPosition[0]
                var sy = self.player.startPosition[1] 
                self.mm.translate([xy[0] - sx, xy[1] - sy, 0.0]);
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
