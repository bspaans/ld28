require(["GlShader", "GlVertices", "GlTexture", "GlScene"]);
var GlFactory = function(gl) {
	var self = this;
	var gl = gl;

	self.makeVertices = function(texture) {
		return new GlVertices(gl, texture);
	}
	self.makeShader = function() {
		return new GlShader(gl);
	}
	self.makeScene = function(shader) {
		return new GlScene(gl, shader);
	}
	self.makeTexture = function(texture, loadedCbObj) {
		return new GlTexture(gl, texture, loadedCbObj);
	}

	return self;
}
