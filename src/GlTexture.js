var GlTexture = function(gl, img, texturesLoadedCallbackObj) {

    var self = this;
    var texture = gl.createTexture();

    self.loadFromImage = function(img) {
        texture.image = new Image();
        texture.image.onload = function () {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.bindTexture(gl.TEXTURE_2D, null);
            texturesLoadedCallbackObj.texturesLoaded = true;
        }
        texture.image.src = img;
    }

    self.attachToShader = function(shader) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(shader.uSampler, 0);
    }

    if (img !== undefined) { self.loadFromImage(img); }
    return self;
}
