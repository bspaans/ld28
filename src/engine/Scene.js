require(["engine.ModelViewMatrixManager", "engine.Lighting", "engine.Camera"]);
var Scene = function(viewportW, viewportH) {
	var self = this;

    self.namedEntities = {}
    self.shapes        = [];
    self.mm       = new ModelViewMatrixManager();
    self.lighting = new Lighting();
    self.camera   = new Camera(viewportW, viewportH);
    self.cameraStartPosition = undefined;

    self.setAmbientLighting     = self.lighting.setAmbientLighting;
    self.setDirectionalLighting = self.lighting.setDirectionalLighting;

    self.setCameraPosition = function(pos) {
        self.camera.position     = pos;
        self.cameraStartPosition = pos.slice(0);
    }

    self.addShape = function(shape, name) {
        shape.name = name;
        self.shapes.push(shape);
        self.namedEntities[name] = shape; 
    }
	return self;
}
