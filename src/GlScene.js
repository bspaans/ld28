require(["ModelViewMatrixManager", "Camera", "Lighting"])

var GlScene = function(gl, shader) {
    var self = this;
    
    self.gl = gl;
    self.mm = new ModelViewMatrixManager();
    self.shader = shader;
    self.camera = new Camera(gl.viewportWidth, gl.viewportHeight);
    self.cameraStartPosition = undefined;

    self.namedEntities = {}
    self.shapes        = [];

    var lighting = new Lighting();
    self.setAmbientLighting     = lighting.setAmbientLighting;
    self.setDirectionalLighting = lighting.setDirectionalLighting;

    self.setCameraPosition = function(pos) {
        self.camera.position     = pos;
        self.cameraStartPosition = pos.slice(0);
    }

    self.addShape = function(shape, name) {
        shape.name = name;
        self.shapes.push(shape);
        self.namedEntities[name] = shape; 
    }

    self.setClearColor = function(r, g, b, a) {
        self.gl.clearColor(r, g, b, a);
        self.gl.enable(gl.DEPTH_TEST);
    }

    self.draw = function(interpolation, drawDynamicShapeCallback) {
        self.gl.viewport(0, 0, self.gl.viewportWidth, self.gl.viewportHeight);
        self.gl.clear(self.gl.COLOR_BUFFER_BIT | self.gl.DEPTH_BUFFER_BIT);
        self.mm.resetPerspective();
        self.camera.setGlPerspective(self.shader);
        self.drawShapes(interpolation, drawDynamicShapeCallback);
    }

    self.drawShapes = function(interpolation, drawDynamicShapeCb) {
        for (var i in self.shapes) {
            self.mm.push();
            self.drawDynamicShape(self.shapes[i], drawDynamicShapeCb);
            self.mm.pop();
        }
    }

    self.drawDynamicShape = function(shape, cb) {
        if (!cb) { return self.drawShape(shape); }
        cb(self, shape.name, shape, self.namedEntities[shape.name]); 
    }

    self.drawShape = function(shape) {
        self.mm.setMatrixUniforms(self.shader); 
        shape.draw(self.shader, lighting);
    }

    return self;
}
