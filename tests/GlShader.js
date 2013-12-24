test("I can map a shader variable", function() {

    var enabled = null;
    var gl = { 
        "getAttribLocation": function(p, variable) { return variable; },
        "enableVertexAttribArray": function(a) { enabled = a; }
    };
    var shader = new GlShader(gl);

    shader.mapShaderVariable("test");
    deepEqual(enabled, "test");
});

test("I can map uniform locations", function() {

    var mapped = [];
    var gl = { "getUniformLocation": function(p, v) { mapped.push(v); return v}}
    var shader = new GlShader(gl);

    var map = ["uPMatrix", "uNMatrix"];
    map.map(shader.mapUniformLocation);

    deepEqual(mapped, ["uPMatrix", "uNMatrix"]);
    deepEqual(shader.uPMatrix, "uPMatrix");
    deepEqual(shader.uNMatrix, "uNMatrix");
});