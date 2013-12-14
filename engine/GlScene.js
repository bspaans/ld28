require(["GlMatrixManager"])
require(["Camera"]);

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

var GlScene = function(gl, shader) {

    var self = this;
    
    self.gl = gl;
    self.mm = new GlMatrixManager();
    self.camera = new Camera();
    self.shapes = [];
    self.framesPerSecond = 0;
    self.ticks = 0;
    self.shader = shader;
    self.player = undefined;

    self.setCameraPosition = function(pos) {
        self.camera.position = pos;
    }

    self.setPlayer = function(p) {
        self.player = p;
        self.player.position = new Position(p.position);
        self.addShape(p);
    }

    self.addShape = function(shape) {
        self.shapes.push(shape);
    }

    self.tick = function(elapsed, currentlyPressedKeys) {
        var current = 1.0 / (elapsed / 1000)
        self.ticks++;
        self.framesPerSecond = self.framesPerSecond * 0.1 + current * 0.9;
        self.handleInput(currentlyPressedKeys);
        self.draw();
    }

    self.handleInput = function(currentlyPressedKeys) {
        var hSpeed = 0.25
        if (currentlyPressedKeys[37]) { // left
            self.camera.moveX(-hSpeed);
            self.player.position.moveX(-hSpeed);
        } 
        if (currentlyPressedKeys[39]) { // right
            self.camera.moveX(hSpeed);
            self.player.position.moveX(hSpeed);
        }
        if (currentlyPressedKeys[38]) { // up
            self.player.position.moveY(hSpeed);
        }
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
            if (self.shapes[i] === self.player) {
                self.mm.mvPushMatrix();
                self.mm.translate(self.player.position.position);
                self.mm.setMatrixUniforms(self.gl, self.shader); 
                self.shapes[i].draw(self.shader);
                self.mm.mvPopMatrix();
            } else {
                self.mm.setMatrixUniforms(self.gl, self.shader); 
                self.shapes[i].draw(self.shader);
            }
        }
    }

    return self;
}
