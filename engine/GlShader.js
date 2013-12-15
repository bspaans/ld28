var GlShader = function(gl, fragmentShader, vertexShader) {

    var self = this;

    self.mapShaderVariable = function(mapTo, variable) {
        self[mapTo] = gl.getAttribLocation(self.program, variable);
        if (self[mapTo] !== -1) {
            gl.enableVertexAttribArray(self[mapTo]);
            console.log("Enabled " + mapTo);
        } else {
            self[mapTo] = undefined;
            console.log("Disabled " + mapTo);
        }
    }

    self.initShaders = function(fragmentShader, vertexShader) {

        var fragmentShader = self.getShader(gl, fragmentShader);
        var vertexShader = self.getShader(gl, vertexShader);

        self.program = gl.createProgram();
        gl.attachShader(self.program, vertexShader);
        gl.attachShader(self.program, fragmentShader);
        gl.linkProgram(self.program);

        if (!gl.getProgramParameter(self.program, gl.LINK_STATUS)) {
            console.log("Could not initialise shaders");
        }

        gl.useProgram(self.program);

        self.mapShaderVariable("vertexNormalAttribute", "aVertexNormal");
        self.mapShaderVariable("vertexPositionAttribute", "aVertexPosition");
        self.mapShaderVariable("vertexColor", "aVertexColor");
        self.mapShaderVariable("textureCoordAttribute", "aTextureCoord");

        self.pMatrixUniform = gl.getUniformLocation(self.program, "uPMatrix");
        self.mvMatrixUniform = gl.getUniformLocation(self.program, "uMVMatrix");
        self.nMatrixUniform = gl.getUniformLocation(self.program, "uNMatrix");
        self.samplerUniform = gl.getUniformLocation(self.program, "uSampler");
        self.ambientColorUniform = gl.getUniformLocation(self.program, "uAmbientColor");
        self.lightingDirectionUniform = gl.getUniformLocation(
                self.program, "uLightingDirection");
        self.directionalColorUniform = gl.getUniformLocation(self.program, "uDirectionalColor");
        return self.program;
    }

    self.getShader = function(gl, id) {
        var shaderScript = document.getElementById(id);
        if (!shaderScript) {
            return null;
        }

        var str = "";
        var k = shaderScript.firstChild;
        while (k) {
            if (k.nodeType == 3) {
                str += k.textContent;
            }
            k = k.nextSibling;
        }

        var shader;
        if (shaderScript.type == "x-shader/x-fragment") {
            shader = gl.createShader(gl.FRAGMENT_SHADER);
        } else if (shaderScript.type == "x-shader/x-vertex") {
            shader = gl.createShader(gl.VERTEX_SHADER);
        } else {
            return null;
        }

        gl.shaderSource(shader, str);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.log("Error while compiling shader: " + id);
            console.log(gl.getShaderInfoLog(shader));
            return null;
        }

        return shader;
    }

    self.initShaders(fragmentShader, vertexShader);
    return self;
}

