require(["GlMatrixManager"])
require(["Camera"]);

var GlScene = function(gl, shader) {

    var self = this;
    
    self.gl = gl;
    self.mm = new GlMatrixManager();
    self.camera = new Camera();
    self.camera.position = [0,0,-15];
    self.shapes = [];
    self.framesPerSecond = 0;
    self.ticks = 0;
    self.shader = shader;

    self.setCameraPosition = function(pos) {
        self.camera.position = pos;
    }

    self.addShape = function(shape) {
        self.shapes.push(shape);
    }

    self.tick = function(elapsed) {
        var current = 1.0 / (elapsed / 1000)
        self.ticks++;
        self.framesPerSecond = self.framesPerSecond * 0.1 + current * 0.9;
        self.draw();
    }

    self.draw = function() {
        self.gl.viewport(0, 0, self.gl.viewportWidth, self.gl.viewportHeight);
        self.gl.clear(self.gl.COLOR_BUFFER_BIT | self.gl.DEPTH_BUFFER_BIT);
        self.mm.resetPerspective();
        self.camera.setGlPerspective(self.gl, self.shader);
        self.drawShapes();
    }

    self.drawShapes = function() {
        for (var i in self.shapes) {
            self.mm.setMatrixUniforms(self.gl, self.shader); 
            self.shapes[i].draw(self.shader);
        }
    }

    return self;
}
