require(["engine.Scene"]);
var GlScene = function(gl, shader) {
    var self = new Scene(gl.viewportWidth, gl.viewportHeight);
    
    self.gl = gl;
    self.shader = shader;

    self.setClearColor = function(r, g, b, a) {
        self.gl.clearColor(r, g, b, a);
        self.gl.enable(gl.DEPTH_TEST);
    }

    self.draw = function(interpolation, drawShapeCb) {
        self.gl.viewport(0, 0, self.gl.viewportWidth, self.gl.viewportHeight);
        self.gl.clear(self.gl.COLOR_BUFFER_BIT | self.gl.DEPTH_BUFFER_BIT);
        self.mm.resetPerspective();
        self.camera.setGlPerspective(self.shader);
        self.drawShapes(interpolation, drawShapeCb);
    }

    self.drawShapes = function(interpolation, drawShapeCb) {
        for (var i in self.shapes) {
            self.mm.push();
            self.drawShape(self.shapes[i], drawShapeCb);
            self.mm.pop();
        }
    }

    self.drawShape = function(shape, cb) {
        if(cb) { return self.doDrawShapeCallback(shape, cb); }
        self.mm.setMatrixUniforms(self.shader); 
        shape.draw(self.shader, self.lighting);
    }
	self.doDrawShapeCallback = function(shape, cb) {
		return cb(self, shape.name, shape, self.namedEntities[shape.name]);
	}
    return self;
}
