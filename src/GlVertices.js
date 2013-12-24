var GlVertices = function(gl, texture) {

    var self = this;
    self.gl = gl;
    self.texture = texture;
    self.baseCube = [
      // Front face
      -1.0, -1.0,  1.0,
       1.0, -1.0,  1.0,
       1.0,  1.0,  1.0,
      -1.0,  1.0,  1.0,

      // Back face
      -1.0, -1.0, -1.0,
      -1.0,  1.0, -1.0,
       1.0,  1.0, -1.0,
       1.0, -1.0, -1.0,

      // Top face
      -1.0,  1.0, -1.0,
      -1.0,  1.0,  1.0,
       1.0,  1.0,  1.0,
       1.0,  1.0, -1.0,

      // Bottom face
      -1.0, -1.0, -1.0,
       1.0, -1.0, -1.0,
       1.0, -1.0,  1.0,
      -1.0, -1.0,  1.0,

      // Right face
       1.0, -1.0, -1.0,
       1.0,  1.0, -1.0,
       1.0,  1.0,  1.0,
       1.0, -1.0,  1.0,

      // Left face
      -1.0, -1.0, -1.0,
      -1.0, -1.0,  1.0,
      -1.0,  1.0,  1.0,
      -1.0,  1.0, -1.0
    ]; // 6 * 4 * 3 = 72 
    self.baseCubeIndeces = [
      0, 1, 2,      0, 2, 3,    // Front face
      4, 5, 6,      4, 6, 7,    // Back face
      8, 9, 10,     8, 10, 11,  // Top face
      12, 13, 14,   12, 14, 15, // Bottom face
      16, 17, 18,   16, 18, 19, // Right face
      20, 21, 22,   20, 22, 23  // Left face
    ];

    self.baseCubeTextureCoords = [
      // Front face
      0.0, 0.0,
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0,

      // Back face
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0,
      0.0, 0.0,

      // Top face
      0.0, 1.0,
      0.0, 0.0,
      1.0, 0.0,
      1.0, 1.0,

      // Bottom face
      1.0, 1.0,
      0.0, 1.0,
      0.0, 0.0,
      1.0, 0.0,

      // Right face
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0,
      0.0, 0.0,

      // Left face
      0.0, 0.0,
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0
    ];
    
    self.baseVertexNormals = [
      // Front face
       0.0,  0.0,  1.0,
       0.0,  0.0,  1.0,
       0.0,  0.0,  1.0,
       0.0,  0.0,  1.0,

      // Back face
       0.0,  0.0, -1.0,
       0.0,  0.0, -1.0,
       0.0,  0.0, -1.0,
       0.0,  0.0, -1.0,

      // Top face
       0.0,  1.0,  0.0,
       0.0,  1.0,  0.0,
       0.0,  1.0,  0.0,
       0.0,  1.0,  0.0,

      // Bottom face
       0.0, -1.0,  0.0,
       0.0, -1.0,  0.0,
       0.0, -1.0,  0.0,
       0.0, -1.0,  0.0,

      // Right face
       1.0,  0.0,  0.0,
       1.0,  0.0,  0.0,
       1.0,  0.0,  0.0,
       1.0,  0.0,  0.0,

      // Left face
      -1.0,  0.0,  0.0,
      -1.0,  0.0,  0.0,
      -1.0,  0.0,  0.0,
      -1.0,  0.0,  0.0,
    ];

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

    self.assignToShaderVariable = function(attr, buf, item_size) {
        self.gl.bindBuffer(self.gl.ARRAY_BUFFER, buf);
        self.gl.vertexAttribPointer(attr, item_size, self.gl.FLOAT, false, 0, 0);
    }

    self.draw = function(shader, ambientColor, lightingDirection, directionalColor) {
        self.assignToShaderVariable(shader.aVertexPosition, self.positionBuffer, 3);
        self.assignToShaderVariable(shader.aTextureCoord, self.vertexTextureCoordsBuffer, 2); 
        self.assignToShaderVariable(shader.aVertexNormal, self.vertexNormalBuffer, 3); 
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
