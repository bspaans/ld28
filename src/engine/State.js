var State = function() {
    var self = this;
    self.stateMachine = undefined;
    self.engine = undefined;

    self.setStateMachine = function(sm) { self.stateMachine = sm; }
    self.setEngine = function(engine) { self.engine = engine; }
    self.activate = function(params) { }
    self.deactivate = function() { }
    
    self.tick = function(scene) { }
    self.inputTick = function(scene, elapsed) { }

    return self;
}
