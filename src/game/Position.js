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
