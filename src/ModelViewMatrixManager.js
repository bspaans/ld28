var ModelViewMatrixManager = function() {

    var self = this;
    var mvMatrix = mat4.create();
    var mvMatrixStack = [];

    self.pop  = function() { mvMatrix = mvMatrixStack.pop(); }
    self.push = function() {
        mvMatrixStack.push(mvMatrix);
		mvMatrix = self.getMatrixCopy()
    }
	self.getMatrixCopy = function()  { 
		var copy = mat4.create();
		mat4.set(mvMatrix, copy);
		return copy; 
	}
    self.translate        = function(p) { mat4.translate(mvMatrix, p); }
    self.resetPerspective = function()  { mat4.identity(mvMatrix); }

    self.setMatrixUniforms = function(shader) {
        var normalMatrix = mat3.create();
        mat4.toInverseMat3(mvMatrix, normalMatrix);
        mat3.transpose(normalMatrix);
        shader.assignToUniformMatrix4fv("uMVMatrix", mvMatrix);
        shader.assignToUniformMatrix3fv("uNMatrix", normalMatrix);
    }
    return self;
}
