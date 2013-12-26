test("I can translate the mvMatrix", function() {

	var mm = new ModelViewMatrixManager();
	mm.resetPerspective();
	var m1 = mm.getMatrixCopy();
	mm.translate([0.0, 1.0, 0.0]);
	notDeepEqual(m1, mm.getMatrixCopy());
});


test("I can push and pop a mvMatrix on the stack", function() {

	var mm = new ModelViewMatrixManager();
	mm.resetPerspective();
	var m1 = mm.getMatrixCopy();

	mm.push();
	deepEqual(m1, mm.getMatrixCopy());

	mm.translate([0.0, 1.0, 0.0]);
	notDeepEqual(m1, mm.getMatrixCopy());

	mm.pop();
	deepEqual(m1, mm.getMatrixCopy());
	
});
