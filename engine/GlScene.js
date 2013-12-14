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
    self.speedX = 0.0;
    self.speedY = 0.5;

    self.isStanding = function(world) {
        var x = self.position.position[0] - 1;
        var y = self.position.position[1];
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
                    self.position.position[1] = sy + sh;
                    return true;
                }
            }
        }
        return false;
    }
    self.jumping = false;
    self.jumptick = 0;
    self.jump = function(world) {
        self.jumping = (self.jumping || self.isStanding(world)) && self.jumptick < 9;
        self.jumptick++;
        if (self.jumping) {
            self.position.moveY(self.speedY);
        } 
    }
    self.stopJumping = function() {
        self.jumping = false;
        self.jumptick = 0;
    }
    self.topSpeedX = 0.3;
    self.isFalling = function(world) {
        return !self.jumping && !self.isStanding(world);
    }
    self.canMoveHorizontally = function(world) {
        var x = self.position.position[0] - 1 + self.speedX;
        var y = self.position.position[1];
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
        if (self.canMoveHorizontally(world)) {
        } else {
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
            self.speedX = Math.min(0.0, self.speedX + 0.01);
        }
        else if (self.speedX > 0) {
            self.speedX = Math.max(0.0, self.speedX - 0.01);
        }
        self.horizontalCollisionCorrection(world);
    }

    return self;
}

var GlScene = function(gl, shader) {

    var self = this;
    
    self.gl = gl;
    self.mm = new GlMatrixManager();
    self.camera = new Camera();
    self.shapes = [];
    self.framesPerSecond = 0;
    self.ticks = 0;
    self.shader = shader;
    self.player = undefined;
    self.solids = [];
    self.texturesLoaded = false;

    self.setCameraPosition = function(pos) {
        self.camera.position = pos;
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

    self.tick = function(elapsed, currentlyPressedKeys) {
        var current = 1.0 / (elapsed / 1000)
        self.ticks++;
        self.framesPerSecond = self.framesPerSecond * 0.1 + current * 0.9;
        self.handleInput(currentlyPressedKeys, elapsed);
        self.draw();
    }

    self.handleInput = function(currentlyPressedKeys, elapsed) {
        if (currentlyPressedKeys[37]) { // left
            self.player.moveRight(self.solids);
        } else if (currentlyPressedKeys[39]) { // right
            self.player.moveLeft(self.solids);
        } else {
            self.player.horizontalMomentum(self.solids);
        }
        self.camera.moveX(self.player.speedX);
        self.player.position.moveX(self.player.speedX);
        if (currentlyPressedKeys[38]) { // up
            self.player.jump(self.solids);
        } else {
            self.player.stopJumping();
        }

        if (self.player.isFalling(self.solids)) {
            self.player.position.moveY(-0.2);
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
                self.mm.translate(self.player.position.position);
                self.mm.setMatrixUniforms(self.gl, self.shader); 
                self.shapes[i].draw(self.shader);
                self.mm.mvPopMatrix();
            } else {
                self.mm.setMatrixUniforms(self.gl, self.shader); 
                self.shapes[i].draw(self.shader);
            }
        }
    }

    return self;
}
