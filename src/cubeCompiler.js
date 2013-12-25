// Rhino code: reads original json scene file and outputs precalculated vertices
if (java.lang) {
    var println = function(line) {
        java.lang.System.out.println(line);
    }
    var print = function(line) {
        java.lang.System.out.print(line);
    }
	importPackage(java.io);
	importPackage(java.lang);
	importPackage(org.mozilla.javascript.NativeJSON);
	var stdin = new BufferedReader(new InputStreamReader(System['in']) );
	var lines = "";
	var l = 0;
	while ((l = stdin.readLine()) != null) { lines += l; }
	var json = eval("(" + new String(lines) + ")");
    var tw = json.texturesPerRow, th = json.texturesPerColumn;

    for (var cubeName in json.cubes) {
        var cubes = json.cubes[cubeName];
        if (!(cubes instanceof Array)) { cubes = [cubes]; }
        var compiled = new CubeBuilder().calculateCubeVertices(cubes, tw, th);
        for (var c in compiled) {
            print(cubeName + '.' + c + ' ');
            for (var i = 0; i < compiled[c].length; i++) {
                print(compiled[c][i]);
                if (i != compiled[c].length - 1) {
                    print(', ');
                }
            }
            println('');
        }
    }
}
