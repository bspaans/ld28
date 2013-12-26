var GlVertices = function(gl, texture) {

    var self = this;

    var createBuffer = function(type, arr) {
        var buf = gl.createBuffer();
        gl.bindBuffer(type, buf);
        gl.bufferData(type, arr, gl.STATIC_DRAW);
        return buf;
    }
    var createArrayBuffer        = function(arr) { return createBuffer(gl.ARRAY_BUFFER, arr); }
    var createElementArrayBuffer = function(arr) { return createBuffer(gl.ELEMENT_ARRAY_BUFFER, arr); }

    self.setVertices = function(vertices, indeces, textureCoords, normals) {
        self.vertexIndexBuffer         = createElementArrayBuffer(new Uint16Array(indeces));
        self.positionBuffer            = createArrayBuffer(new Float32Array(vertices));
        self.vertexTextureCoordsBuffer = createArrayBuffer(new Float32Array(textureCoords));
        self.vertexNormalBuffer        = createArrayBuffer(new Float32Array(normals));
        self.numberOfPositionVertices  = vertices.length;
    }

    self.draw = function(shader, lighting) {
        shader.assignToShaderVariable("aVertexPosition", self.positionBuffer, 3);
        shader.assignToShaderVariable("aTextureCoord", self.vertexTextureCoordsBuffer, 2); 
        shader.assignToShaderVariable("aVertexNormal", self.vertexNormalBuffer, 3); 
        texture.attachToShader(shader);
        lighting.attachToShader(shader);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, self.vertexIndexBuffer);
        gl.drawElements(gl.TRIANGLES, self.numberOfPositionVertices / 2, gl.UNSIGNED_SHORT, 0);
    }
    return self;
}
