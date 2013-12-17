
require(["Engine", "GlShader", "GlScene", "GlTexture", "GlVertices"]);

var statusSpan;

function webGLStart() {
    var engine = new Engine();
    fps = document.getElementById("fps");
    statusSpan = document.getElementById("status");
    timeLeft = document.getElementById("time");
    score = document.getElementById("score");

    try { 
        gl = engine.initGLOnCanvas("lesson01-canvas");
    } catch(e) {
        console.log(e);
        statusSpan.innerHTML = "Could not load OpenGL";
        return;
    }
    engine.loadScene("resources/scene.json");
    engine.firstTick();
}
