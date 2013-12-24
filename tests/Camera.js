

test("I can move the camera to the left and right", function() {

        var camera = new Camera();
        
        equal(camera.getX(), 0);
        camera.moveX(2);
        equal(camera.getX(), 2);
        camera.moveX(-2);
        equal(camera.getX(), 0);
        camera.moveX(-2);
        equal(camera.getX(), -2);
});

test("I can move the camera up and down", function() {

        var camera = new Camera();
        
        equal(camera.getY(), 0);
        camera.moveY(2);
        equal(camera.getY(), 2);
        camera.moveY(-2);
        equal(camera.getY(), 0);
        camera.moveY(-2);
        equal(camera.getY(), -2);
});

test("I can move the camera back and forth", function() {

        var camera = new Camera();
        
        equal(camera.getZ(), 0);
        camera.moveZ(2);
        equal(camera.getZ(), 2);
        camera.moveZ(-2);
        equal(camera.getZ(), 0);
        camera.moveZ(-2);
        equal(camera.getZ(), -2);
});
