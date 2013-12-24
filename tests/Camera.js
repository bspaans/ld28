

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
