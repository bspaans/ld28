var GlVertices = function(gl, texture) {

    var self = this;
    self.gl = gl;
    self.texture = texture;

    self.setVertices = function(vertices, indeces, textureCoords, normals) {
        self.vertexIndexBuffer         = self.createElementArrayBuffer(new Uint16Array(indeces));
        self.positionBuffer            = self.createArrayBuffer(new Float32Array(vertices));
        self.vertexTextureCoordsBuffer = self.createArrayBuffer(new Float32Array(textureCoords));
        self.vertexNormalBuffer        = self.createArrayBuffer(new Float32Array(normals));
        self.numberOfPositionVertices  = vertices.length;
    }

    self.createArrayBuffer        = function(arr) { return self.createBuffer(self.gl.ARRAY_BUFFER, arr); }
    self.createElementArrayBuffer = function(arr) { return self.createBuffer(self.gl.ELEMENT_ARRAY_BUFFER, arr); }

    self.createBuffer = function(type, arr) {
        var buf = self.gl.createBuffer();
        self.gl.bindBuffer(type, buf);
        self.gl.bufferData(type, arr, self.gl.STATIC_DRAW);
        return buf;
    }

    self.draw = function(shader, ambientColor, lightingDirection, directionalColor) {
        shader.assignToShaderVariable(gl, "aVertexPosition", self.positionBuffer, 3);
        shader.assignToShaderVariable(gl, "aTextureCoord", self.vertexTextureCoordsBuffer, 2); 
        shader.assignToShaderVariable(gl, "aVertexNormal", self.vertexNormalBuffer, 3); 
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, self.texture.texture);
        gl.uniform1i(shader.uSampler, 0);
        gl.uniform3fv(shader.uAmbientColor, ambientColor);
        gl.uniform3fv(shader.uLightingDirection, lightingDirection);
        gl.uniform3fv(shader.uDirectionalColor, directionalColor);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, self.vertexIndexBuffer);
        self.gl.drawElements(self.gl.TRIANGLES, self.numberOfPositionVertices / 2, self.gl.UNSIGNED_SHORT, 0);
    }
    return self;
}
