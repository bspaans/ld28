// Warning: this is a compiled file
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

    self.getX = function() {
        return -self.position[0];
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



test("I can move the camera to the left and right", function() {

        var camera = new Camera();
        
        equal(camera.getX(), 0);
        camera.moveX(2);
        equal(camera.getX(), 2);
        camera.moveX(-2);
        equal(camera.getX(), 0);
        camera.moveX(-2);
        equal(camera.getX(), -2);
});
