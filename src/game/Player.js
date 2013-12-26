require(["game.Position"]);
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
