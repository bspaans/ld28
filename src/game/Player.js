require(["game.Position", "game.World"]);
var Player = function(player) {
    var self = this;
    self.player = player;
    self.position = new Position(player.json[0].v);
    self.startPosition = self.position.position.slice();
    var speedX = 0.0;
    var speedY = 0.0;
    var topSpeedX = 0.6;
    var topSpeedY = 0.7;
    var jumping = false;
    var jumptick = 0;
    self.lastStandingPos = undefined;

    self.movingX = 0.0;
    self.movingY = 0.0;

    self.resetPosition = function(pos) {
        self.position = new Position(pos.slice(0));
        speedX = 0.0;
        speedY = 0.0;
        jumping = false;
        jumptick = 0;
    }

    self.right = function() { self.movingX = 1; };
    self.left = function() { self.movingX = -1; };
    self.up = function() { self.movingY = 1; };

    self.interpolateMove = function(pos, interpolation) {
        var x = pos[0]+ speedX * interpolation 
        var y = pos[1]+ speedY * interpolation 
        return [x,y,pos[2]];
    }

    self.move = function(world) {
        world = new World(world);
        if (self.movingX == 1) {
            moveRight(world);
        } else if (self.movingX == -1) {
            moveLeft(world);
        } else {
            horizontalMomentum(world);
        }
        if (self.movingY == 1) {
            jump(world);
        } else {
            jumping = false;
        }
        gravity(world);

        self.position.moveX(speedX)
        self.position.moveY(speedY);
    }

    var isStanding = function(world, speed) {
        return world.entityIsStanding(self, speed);
    }

    var jump = function(world) {
        jumping = (jumping || isStanding(world)) && jumptick < 7;
        jumptick += 1;
        if (jumping) {
            speedY = topSpeedY; 
        } 
    }
    var moveHorizontally = function(world, speed) {
        if (!speed) { speed = speedX;}
        speedX = (!world.entityCanMoveHorizontally(self, speed)) ? 0.0 : speed;
    }
    var moveRight = function(world) {
        moveHorizontally(world, Math.max(-topSpeedX, speedX - 0.1));
    }
    var moveLeft = function(world) {
        moveHorizontally(world, Math.min(topSpeedX, speedX + 0.1));
    }
    var horizontalMomentum = function(world) {
        var s = speedX;
        if      (s < 0) { s = Math.min(0.0, s + 0.04); }
        else if (s > 0) { s = Math.max(0.0, s - 0.04); }
        moveHorizontally(world, s);
    }
    var gravity = function(world) {
        if (!jumping && !isStanding(world)) {
            jumptick = 0;
            self.movingY = 0.0;
            speedY = Math.max(-1 * (topSpeedY * 2), speedY - 0.2);
            if (isStanding(world, [speedX, speedY])) {
                speedY = 0.0;
            }
        }
    }
    return self;
}
