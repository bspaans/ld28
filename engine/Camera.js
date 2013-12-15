var Camera = function() {
    var self = this;

    self.matrix = mat4.create();
    self.position = vec3.create();

    self.setGlPerspective = function(gl, shaderProgram) {
        var fov = 45;
        var widthToHeightRatio = gl.viewportWidth / gl.viewportHeight;
        var cutOffClose = 0.1;
        var cutOffFarAway = 100.0;

        // GLOBAL mat4
        mat4.perspective(fov, widthToHeightRatio, cutOffClose, cutOffFarAway, self.matrix);
        mat4.translate(self.matrix, self.position);
        //mat4.rotate(self.matrix, 0.2, [0.0, 1.0, 0.0]);
        //mat4.rotate(self.matrix, 0.5, [1.0, 0.0, 0.0]);
        gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, self.matrix);
    }

    self.moveX = function(d) {
        self.position[0] += -d;
    }
    self.moveY = function(d) {
        self.position[1] += -d;
    }
    self.moveZ = function(d) {
        self.position[2] += -d;
    }

    return self;
}

