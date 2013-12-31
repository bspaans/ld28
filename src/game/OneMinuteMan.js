require(["engine.Engine", "game.Player", "game.UI", "game.Game", "game.GameOver", "game.RestartScene", "game.LoadScene"]);

var OneMinuteMan = function() {
    var self = new Engine();
    self.ui = new UI();

    audiojs.events.ready(function() {
        var options = {};
        self.soundtrack = audiojs.newInstance(document.getElementById("soundtrack"), options);
        $("#audio").hide();
        
    });

    self.start = function() {
        try { 
            self.initGLOnCanvas("lesson01-canvas");
        } catch(e) {
            console.log(e);
            self.ui.setStatus("Could not load OpenGL<br/>" + e.toString());
            return;
        }
        self.addState("GAME"       , new Game());
        self.addState("GAME_OVER"  , new GameOver());
        self.addState("RESTART"    , new RestartScene());
        self.addState("LOAD_SCENE" , new LoadScene());

        var sceneLocation = "resources/scene.json";
        self.stateMachine.changeToState("LOAD_SCENE", sceneLocation);
    }
    return self;
}

function webGLStart() {
    new OneMinuteMan().start();
}
