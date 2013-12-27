var UI = function() {
    var self = this;
    var elem_fps       = document.getElementById("fps");
    var elem_status    = document.getElementById("status");
    var elem_time_left = document.getElementById("time");
    var elem_score     = document.getElementById("score");

    self.setFPS      = function(f) { elem_fps.innerHTML       = f; }
    self.setStatus   = function(s) { elem_status.innerHTML    = s; }
    self.setTimeLeft = function(t) { elem_time_left.innerHTML = t; }
    self.setScore    = function(s) { elem_score.innerHTML     = s; }
    return self;
}
