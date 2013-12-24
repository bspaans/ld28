var GlShader = function(gl) {

    var self = this;

    self.mapShaderVariable = function(variable) {
        var a = gl.getAttribLocation(self.program, variable);
        if (a === -1) return;
        gl.enableVertexAttribArray(a);
        self[variable] = a;
    }

    self.mapUniformLocation = function(variable) {
        self[variable] = gl.getUniformLocation(self.program, variable);
    }

    self.initShaders = function(fShader, vShader, vars, uniformLocs) {
        self.program = gl.createProgram();
        self.compileAndAttachShader(gl, gl.FRAGMENT_SHADER, fShader);
        self.compileAndAttachShader(gl, gl.VERTEX_SHADER, vShader);
        gl.linkProgram(self.program);
        if (!gl.getProgramParameter(self.program, gl.LINK_STATUS)) {
            throw "Could not initialise shaders";
        }
        gl.useProgram(self.program);
        uniformLocs.map(self.mapUniformLocation);
        vars.map(self.mapShaderVariable);
        return self.program;
    }

    self.compileAndAttachShader = function(gl, shaderType, shaderScript) {
        var shader = gl.createShader(shaderType);
        gl.shaderSource(shader, shaderScript);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.log(gl.getShaderInfoLog(shader));
            return null;
        }
        gl.attachShader(self.program, shader);
        return shader;
    }
    return self;
}
