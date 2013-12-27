require(["engine.State"]);
var StateMachine = function() {
    var self = this;
    var states = {};
    var currentState = undefined;

    self.addState = function(name, state) { 
        states[name] = state; 
        state.name = name;
        state.setStateMachine(self);
    }
    var setCurrentState = function(name) { currentState = name; }
    self.getCurrentState = function() { return currentState; }
    self.changeToState = function(name, activateParams) {
        if (currentState) { currentState.deactivate(); }
        setCurrentState(name);
        currentState.activate(activateParams);
    }

    return self;
}
