require(["GlShader", "GlVertices", "GlTexture", "GlScene"]);
var GlFactory = function(gl) {
	var self = this;

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

GlFactory.initGLOnCanvas = function(canvasId) {
	var canvas = document.getElementById(canvasId);
	if (canvas == null) { throw "Can't find canvas with id " + canvasId; }
	return GlFactory.initGLOnCanvasElement(canvas);
}
GlFactory.initGLOnCanvasElement = function(canvasElement) {
	var gl = undefined;
	try { gl = canvasElement.getContext("experimental-webgl"); } 
	catch (e) { console.log(e) }

	if (!gl) { throw "WebGL Initialization error" }
	gl.viewportWidth  = canvasElement.width;
	gl.viewportHeight = canvasElement.height;
	return new GlFactory(gl);
}
