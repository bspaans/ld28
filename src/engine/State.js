var State = function() {
    var self = this;
    self.stateMachine = undefined;

    self.setStateMachine(sm) { self.stateMachine = sm; }
    self.activate(params) { }
    self.deactivate() { }

    return self;
}
