require(["GlMatrixManager"])
require(["Camera"]);

var GlScene = function(gl, shader) {

    var self = this;
    
    self.gl = gl;
    self.mm = new GlMatrixManager();
    self.camera = new Camera();
    self.cameraStartPosition = undefined;
    self.shader = shader;
    self.namedEntities = {}
    self.texturesLoaded = false;
    self.shapes = [];
    self.solids = [];

    self.ambientColor = undefined;
    self.lightingDirection = undefined;
    self.directionalColor = undefined;

    audiojs.events.ready(function() {
        var options = {};
        self.soundtrack = audiojs.newInstance(document.getElementById("soundtrack"), options);
        $("#audio").hide();
        
    });

    self.setCameraPosition = function(pos) {
        self.camera.position = pos;
        self.cameraStartPosition = pos.slice(0);
    }

    // remove with new JSON format
    self.setPlayer = function(p) {
        self.addShape(p, "player");
    }

    self.setSolids = function(s) {
        self.solids = s;
    }

    self.addShape = function(shape, name) {
        shape.name = name;
        self.shapes.push(shape);
        if (name) { self.namedEntities[name] = shape; }
    }

    self.draw = function(interpolation, drawDynamicShapeCallback) {
        self.gl.viewport(0, 0, self.gl.viewportWidth, self.gl.viewportHeight);
        self.gl.clear(self.gl.COLOR_BUFFER_BIT | self.gl.DEPTH_BUFFER_BIT);
        self.mm.resetPerspective();
        self.camera.setGlPerspective(self.gl, self.shader);
        self.drawShapes(interpolation, drawDynamicShapeCallback);
    }

    self.drawShape = function(shape) {
        self.mm.setMatrixUniforms(self.gl, self.shader); 
        shape.draw(self.shader, self.ambientColor, self.lightingDirection, self.directionalColor);
    }

    self.renderDynamicShape = function(name, shape, entityRef) {
        self.mm.mvPushMatrix();
        self.drawDynamicShape(name, shape, entityRef);
        self.mm.mvPopMatrix();
    }

    self.drawDynamicShape = function(name, shape, entityRef) {
        self.drawShape(shape);
    }

    self.drawShapes = function(interpolation, drawDynamicShapeCallback) {
        for (var i in self.shapes) {
            var s = self.shapes[i]
            if (s.name && self.namedEntities[s.name]) {
                if (drawDynamicShapeCallback) {
                    drawDynamicShapeCallback(self, s.name, s, self.namedEntities[s.name]);
                } else {
                    self.renderDynamicShape(s.name, s, self.namedEntities[s.name]);
                }
            } else {
                self.drawShape(s);
            }
        }
    }

    return self;
}
