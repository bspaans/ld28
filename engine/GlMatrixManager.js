var GlMatrixManager = function(mvMatrix) {

    var self = this;
    self.mvMatrix = mat4.create(); // model-view matrix
    self.mvMatrixStack = [];

    self.mvPushMatrix = function() {
        var copy = mat4.create();
        mat4.set(self.mvMatrix, copy);
        self.mvMatrixStack.push(copy);
    }

    self.mvPopMatrix = function() {
        if (self.mvMatrixStack.length == 0) {
            throw "Invalid popMatrix!";
        }
        mvMatrix = self.mvMatrixStack.pop();
    }

    self.setMatrixUniforms = function(gl, program) {
        gl.uniformMatrix4fv(program.mvMatrixUniform, false, self.mvMatrix);
    }

    self.resetPerspective = function() {
        mat4.identity(self.mvMatrix);
    }

    return self;
}
