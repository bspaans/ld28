var Lighting = function() {
    var self = this;

    var uAmbientColor      = undefined;
    var uLightingDirection = undefined;
    var uDirectionalColor  = undefined;

    self.setAmbientLighting     = function(a) { uAmbientColor = a; }
    self.setDirectionalLighting = function(dir, col) {
        uLightingDirection = dir;
        uDirectionalColor  = col;
    }

    self.attachToShader = function(shader) {
        shader.assignToUniform3fv("uAmbientColor", uAmbientColor);
        shader.assignToUniform3fv("uLightingDirection", uLightingDirection);
        shader.assignToUniform3fv("uDirectionalColor", uDirectionalColor);
    }
};
