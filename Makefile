
JAVA_HOME=/usr/lib/jvm/java-7-openjdk-amd64
JAVA=${JAVA_HOME}/bin/java

default: build

target:
	mkdir -p target

build: target	
	rhino ext/r.js -o baseUrl=src name=engine out=target/engine.min.js

quick: target
	rhino ext/r.js -o baseUrl=src optimize=none name=engine out=target/engine.quick.js
	sed '/^\(require\|define\)(.*);\?\s*$$/d' target/engine.quick.js > target/engine.js

dirty: target
	cat src/Engine.js src/SceneLoader.js src/GlShader.js src/GlMatrixManager.js src/Camera.js src/GlShape.js src/GlScene.js src/GlTexture.js src/GlVertices.js src/engine.js > target/engine.dirty.js
	sed '/^\(require\|define\)(.*);\?\s*$$/d' target/engine.dirty.js > target/engine.js

tilemap:
	montage -geometry +0+0 resources/1.gif resources/2.gif resources/tiles_1.gif
	montage -geometry +0+0 resources/3.gif resources/4.gif resources/tiles_2.gif
	montage -geometry +0+0 -tile 1x2 resources/tiles_1.gif resources/tiles_2.gif resources/tiles_.gif
	convert resources/tiles_.gif resources/tiles.gif
	rm resources/tiles_*.gif

test:
	echo "// Warning: this is a compiled file" > tests/tests.js
	cat src/Camera.js tests/Camera.js >> tests/tests.js
	cat src/SceneLoader.js tests/SceneLoader.js >> tests/tests.js


clean:
	rmdir target

server:
	python -m SimpleHTTPServer

