var Camera = function() {
    var self     = this;
    var fov      = 45; 
    var tooFar   = 100; 
    var tooClose = 0.1; 

    var matrix    = mat4.create();
    self.position = vec3.create();

    self.perspectiveMatrix = function(viewportRatio) {
        mat4.perspective(fov, viewportRatio, tooClose, tooFar, matrix);
        mat4.translate(matrix, self.position);
        return matrix;
    }

    self.setGlPerspective = function(gl, shaderProgram) {
        var viewportRatio = gl.viewportWidth / gl.viewportHeight;
        var m = self.perspectiveMatrix(viewportRatio);
        gl.uniformMatrix4fv(shaderProgram.uPMatrix, false, m);
    }

    self.getX  = function()  { return -self.position[0]; } 
    self.getY  = function()  { return -self.position[1]; } 
    self.getZ  = function()  { return -self.position[2]; } 

    self.moveX = function(d) { self.position[0] += -d;   } 
    self.moveY = function(d) { self.position[1] += -d;   } 
    self.moveZ = function(d) { self.position[2] += -d;   } 

    return self;
}
