var GlShader = function(gl) {

    var self = this;

    self.mapShaderVariable = function(variable) {
        self[variable] = gl.getAttribLocation(self.program, variable);
        if (self[variable] === -1) return self[variable] = undefined;
        gl.enableVertexAttribArray(self[variable]);
    }

    self.mapUniformLocation = function(variable) {
        self[variable] = gl.getUniformLocation(self.program, variable);
    }

    self.initShaders = function(fShader, vShader, vars, uniformLocs) {
        self.program = gl.createProgram();
        compileAndAttachShader(gl.FRAGMENT_SHADER, fShader);
        compileAndAttachShader(gl.VERTEX_SHADER, vShader);
        gl.linkProgram(self.program);
        if (!gl.getProgramParameter(self.program, gl.LINK_STATUS)) {
            throw "Could not initialise shaders";
        }
        gl.useProgram(self.program);
        uniformLocs.map(self.mapUniformLocation);
        vars.map(self.mapShaderVariable);
        return self.program;
    }

    var compileAndAttachShader = function(shaderType, shaderScript) {
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
    self.assignToShaderVariable = function(attr, buf, item_size) {
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.vertexAttribPointer(self[attr], item_size, gl.FLOAT, false, 0, 0);
    }
    self.assignToUniform3fv = function(attr, val) {
        gl.uniform3fv(self[attr], val);
    }
    self.assignToUniformMatrix3fv = function(attr, val) {
        gl.uniformMatrix3fv(self[attr], false, val);
    }
    self.assignToUniformMatrix4fv = function(attr, val) {
        gl.uniformMatrix4fv(self[attr], false, val);
    }
    return self;
}
