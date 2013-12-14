require(["GlShape"]);

var GlVertices = function(gl, texture) {

    var self = new GlShape(gl);
    self.texture = texture;
    self.numberOfPositionVertices = 0;
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
    
    self.setVertices = function(vertices, indeces, textureCoords) {
        self.positionBuffer = self.createArrayBuffer(vertices);
        self.numberOfPositionVertices = vertices.length;
        self.vertexIndexBuffer = self.createElementArrayBuffer(indeces);
        self.vertexTextureCoordsBuffer = self.createArrayBuffer(textureCoords);
    }

    self.draw = function(shader) {
        self.assignBufferToShaderProgramAttribute(shader.vertexPositionAttribute, self.positionBuffer, 3);
        self.assignBufferToShaderProgramAttribute(shader.textureCoordAttribute, self.vertexTextureCoordsBuffer, 2); 
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, self.texture.texture);
        gl.uniform1i(shader.samplerUniform, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, self.vertexIndexBuffer);
        self.gl.drawElements(self.gl.TRIANGLES, self.numberOfPositionVertices / 2, self.gl.UNSIGNED_SHORT, 0);
    }
    return self;
}
