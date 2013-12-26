var Camera = function(viewportW, viewportH) {
    var self          = this;
    var fov           = 45;
    var viewportRatio = viewportW / viewportH;
    var tooFar        = 100;
    var tooClose      = 0.1;

    var matrix    = mat4.create();
    self.position = vec3.create();

    self.setGlPerspective = function(shader) {
        mat4.perspective(fov, viewportRatio, tooClose, tooFar, matrix);
        mat4.translate(matrix, self.position);
        shader.assignToUniformMatrix4fv("uPMatrix", matrix);
    }

    self.getX  = function()  { return -self.position[0]; } 
    self.getY  = function()  { return -self.position[1]; } 
    self.getZ  = function()  { return -self.position[2]; } 

    self.moveX = function(d) { self.position[0] += -d;   } 
    self.moveY = function(d) { self.position[1] += -d;   } 
    self.moveZ = function(d) { self.position[2] += -d;   } 

    return self;
}
