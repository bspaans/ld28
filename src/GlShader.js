var GlShader = function(gl, fragmentShader, vertexShader) {

    var self = this;

    self.mapShaderVariable = function(variable) {
        var a = gl.getAttribLocation(self.program, variable);
        if (a !== -1) {
            gl.enableVertexAttribArray(a);
            console.log("Enabled " + variable);
            self[variable] = a;
            return;
        }
        console.log("Disabled " + variable);
    }

    self.mapShaderVariabels = function(variables) {
        variables.map(self.mapShaderVariable);
    }
    self.mapUniformLocations = function(locations) {
        locations.map(function(v) { 
            self[v] = gl.getUniformLocation(self.program, v);
        });
    }

    self.initShaders = function(fragmentShader, vertexShader) {

        self.program = gl.createProgram();
        self.addShader(gl, fragmentShader, gl.FRAGMENT_SHADER);
        self.addShader(gl, vertexShader, gl.VERTEX_SHADER);
        gl.linkProgram(self.program);
        if (!gl.getProgramParameter(self.program, gl.LINK_STATUS)) {
            console.log("Could not initialise shaders");
        }
        gl.useProgram(self.program);

        var variables = ["aVertexNormal", "aVertexPosition", "aTextureCoord"];
        var uniform = ["uPMatrix", "uMVMatrix", "uNMatrix", "uSampler", 
            "uAmbientColor", "uLightingDirection", "uDirectionalColor"];

        self.mapShaderVariables(variables);
        self.mapUniformLocations(uniform);
        return self.program;
    }

    self.readTextFromScriptAttribute = function(elem) {
        var str = "";
        var k = elem.firstChild;
        while (k) {
            if (k.nodeType == 3) { str += k.textContent; }
            k = k.nextSibling;
        }
        return str;
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

    self.addShader = function(gl, id, type) {
        var shaderScript = document.getElementById(id);
        if (!shaderScript) { return null; }
        var str = self.readTextFromScriptAttribute(shaderScript);
        return self.compileAndAttachShader(gl, type, str);
    }

    if (fragmentShader && vertexShader) {
        self.initShaders(fragmentShader, vertexShader);
    }
    return self;
}
