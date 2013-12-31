var Timer = function() {

	var self = this;

    var FRAMES_PER_SEC = 30;
    var FRAMES_MS = 1000 / FRAMES_PER_SEC;
    var nextTick = new Date().getTime() + FRAMES_MS;
    var lastTime = 0; 

    self.getElapsedTime = function() {
		var timeNow = self.now();
        var elapsed = lastTime == 0 ? 1 : timeNow - lastTime;
        lastTime = timeNow;
        return elapsed;
    }
	self.getPlaceInFrame = function() {
		return (self.now() + FRAMES_MS - nextTick) / FRAMES_MS;
	}
	self.now = function() { return new Date().getTime(); }
	self.isLaterThanNextTick = function(now) { return now > nextTick; }
	self.calculateNextTick = function() { nextTick += FRAMES_MS }
    self.reset = function() { 
        lastTime = 0; 
        nextTick = new Date().getTime() + FRAMES_MS;
    }

	return self;
}
