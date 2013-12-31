var World = function(world) {
    var self = this;

    self.entityIsStanding = function(entity, speed, correct = true) {
        if (!speed) { speed = [0, 0]; }
        var x = entity.position.position[0] - 1 + speed[0];
        var y = entity.position.position[1] - 1 + speed[1];
        var w = 2, h = 2;
        for (var s in world) {
            var solid = world[s];
            var sx = solid[0], sy = solid[1], sw = solid[2], sh = solid[3];
            if (x > sx - w && x < sx + sw && y >= sy + 0.01 
                    && y <= sy + sh + (1 / 8096)) {
                if (correct) {
                    entity.position.position[1] = sy + sh + 1;
                    entity.lastStandingPos = [sx + 1, sy + sh + 5, 0.0];
                }
                return true;
            }
        }
        return false;
    }

    self.entityCanMoveHorizontally = function(entity, speedX) {
        var x = entity.position.position[0] - 1 + speedX;
        var y = entity.position.position[1] - 1;
        var w = 2, h = 2;
        for (var s in world) {
            var solid = world[s];
            var sx = solid[0], sy = solid[1], sw = solid[2], sh = solid[3];
            if (x + w > sx  && x < sx + sw && y >= sy - h && y < sy + sh) {
                return false;
            }
        }
        return true;
    }
    return self;
}
