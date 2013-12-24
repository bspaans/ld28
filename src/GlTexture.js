var GlTexture = function(gl, img, scene) {

    var self = this;
    self.scene = scene;
    self.texture = gl.createTexture();

    self.loadFromImage = function(img) {
        self.texture.image = new Image();
        self.texture.image.onload = function () {
            gl.bindTexture(gl.TEXTURE_2D, self.texture);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, self.texture.image);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.bindTexture(gl.TEXTURE_2D, null);
            self.scene.texturesLoaded = true;
        }
        self.texture.image.src = img;
    }

    if (img !== undefined) {
        self.loadFromImage(img);
    }

    return self;
}
