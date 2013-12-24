require(["GlMatrixManager"])
require(["Camera"]);

var GlScene = function(gl, shader) {

    var self = this;
    
    self.gl = gl;
    self.mm = new GlMatrixManager();
    self.shader = shader;
    self.camera = new Camera();
    self.cameraStartPosition = undefined;

    self.namedEntities = {}
    self.shapes        = [];

    var ambientColor      = undefined;
    var lightingDirection = undefined;
    var directionalColor  = undefined;

    self.setAmbientLighting = function(a) {
        ambientColor = a;
    }

    self.setDirectionalLighting = function(dir, col) {
        lightingDirection = dir;
        directionalColor  = col;
    }

    self.setCameraPosition = function(pos) {
        self.camera.position     = pos;
        self.cameraStartPosition = pos.slice(0);
    }

    self.addShape = function(shape, name) {
        shape.name = name;
        self.shapes.push(shape);
        self.namedEntities[name] = shape; 
    }

    self.draw = function(interpolation, drawDynamicShapeCallback) {
        self.gl.viewport(0, 0, self.gl.viewportWidth, self.gl.viewportHeight);
        self.gl.clear(self.gl.COLOR_BUFFER_BIT | self.gl.DEPTH_BUFFER_BIT);
        self.mm.resetPerspective();
        self.camera.setGlPerspective(self.gl, self.shader);
        self.drawShapes(interpolation, drawDynamicShapeCallback);
    }

    self.drawShapes = function(interpolation, drawDynamicShapeCb) {
        for (var i in self.shapes) {
            var shape = self.shapes[i];
            var entity = self.namedEntities[s.name];
            self.mm.mvPushMatrix();
            self.drawDynamicShape(shape, entityRef, drawDynamicShapeCb);
            self.mm.mvPopMatrix();
        }
    }

    self.drawDynamicShape = function(shape, entityRef, cb) {
        if (!cb) { return self.drawShape(shape); }
        cb(self, shape.name, shape, entityRef); 
    }

    self.drawShape = function(shape) {
        self.mm.setMatrixUniforms(self.gl, self.shader); 
        shape.draw(self.shader, ambientColor, 
            lightingDirection, directionalColor);
    }

    return self;
}
