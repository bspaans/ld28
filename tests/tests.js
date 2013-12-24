// Warning: this is a compiled file
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
        gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, m);
    }

    self.getX  = function()  { return -self.position[0]; } 
    self.getY  = function()  { return -self.position[1]; } 
    self.getZ  = function()  { return -self.position[2]; } 

    self.moveX = function(d) { self.position[0] += -d;   } 
    self.moveY = function(d) { self.position[1] += -d;   } 
    self.moveZ = function(d) { self.position[2] += -d;   } 

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

test("I can move the camera up and down", function() {

        var camera = new Camera();
        
        equal(camera.getY(), 0);
        camera.moveY(2);
        equal(camera.getY(), 2);
        camera.moveY(-2);
        equal(camera.getY(), 0);
        camera.moveY(-2);
        equal(camera.getY(), -2);
});

test("I can move the camera back and forth", function() {

        var camera = new Camera();
        
        equal(camera.getZ(), 0);
        camera.moveZ(2);
        equal(camera.getZ(), 2);
        camera.moveZ(-2);
        equal(camera.getZ(), 0);
        camera.moveZ(-2);
        equal(camera.getZ(), -2);
});

test("If I move the camera, the perspective matrix changes accordingly", function() {

        var camera = new Camera();
        var pMatrix = mat4.create();
        var pMatrixCamera = camera.perspectiveMatrix();
        //mat4.set(pMatrixCamera, pMatrix);

        deepEqual(pMatrix, pMatrixCamera);
        camera.moveX(2);
        var pMatrixCamera = camera.perspectiveMatrix();
        deepEqual(pMatrix, pMatrixCamera);
});
