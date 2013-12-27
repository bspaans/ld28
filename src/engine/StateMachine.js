require(["engine.State"]);
var StateMachine = function(engine) {
    var self = this;
    var states = {};
    var currentState = undefined;

    self.addState = function(name, state) { 
        states[name] = state; 
        state.name = name;
        state.setStateMachine(self);
        state.setEngine(engine);
    }
    self.getCurrentState = function() { return currentState; }
    self.changeToState = function(name, activateParams) {
        if (currentState) { currentState.deactivate(); }
        currentState = states[name];
        currentState.activate(activateParams);
    }
    return self;
}
