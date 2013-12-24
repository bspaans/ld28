var GlShape = function(gl) {
    var self = this;

    self.gl = gl;
    self.positionBuffer = null;
    self.colorBuffer = null;

    self.checkArraySize = function(arr, expected) {
        if (arr.length != expected) { throw ("Expecting an array of size " + expected + " got: " + arr.length) }
    }

    self.setVertices = function(vertices) {
        self.checkArraySize(vertices, self.numberOfPositionVertices * 3);
        self.positionBuffer = self.createArrayBuffer(vertices);
    }

    self.setColors = function(colors) {
        self.checkArraySize(colors, self.numberOfPositionVertices * 4);
        self.colorBuffer = self.createArrayBuffer(colors);
    }

    self.createArrayBuffer = function(arr) {
        var buf = self.gl.createBuffer();
        self.gl.bindBuffer(self.gl.ARRAY_BUFFER, buf);
        self.gl.bufferData(self.gl.ARRAY_BUFFER, new Float32Array(arr), self.gl.STATIC_DRAW);
        return buf;
    }

    self.createElementArrayBuffer = function(arr) {
        var buf = self.gl.createBuffer();
        self.gl.bindBuffer(self.gl.ELEMENT_ARRAY_BUFFER, buf);
        self.gl.bufferData(self.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(arr), gl.STATIC_DRAW);
        return buf;
    }

    self.assignBufferToShaderProgramAttribute = function(attr, buf, item_size) {
        self.gl.bindBuffer(self.gl.ARRAY_BUFFER, buf);
        self.gl.vertexAttribPointer(attr, item_size, self.gl.FLOAT, false, 0, 0);
    }

    self.assignPositionAndColorToShaderAttributes = function(shader) {
        self.assignBufferToShaderProgramAttribute(shader.aVertexPosition, self.positionBuffer, 3); 
        //self.assignBufferToShaderProgramAttribute(shader.aVertexColor, self.colorBuffer, 4); 
    }

    self.draw = function(shader) {
        self.assignPositionAndColorToShaderAttributes(shader);
        if (!self.drawStyle) { throw "drawStyle is not defined"; }
        self.gl.drawArrays(self.drawStyle, 0, self.numberOfPositionVertices);
    }

    return self;
};
