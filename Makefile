
JAVA_HOME=/usr/lib/jvm/java-7-openjdk-amd64
JAVA=${JAVA_HOME}/bin/java

default: build

target:
	mkdir -p target

build: target	
	rhino ext/r.js -o baseUrl=engine name=engine out=target/engine.min.js

quick: target
	rhino ext/r.js -o baseUrl=engine optimize=none name=engine out=target/engine.quick.js
	sed '/^\(require\|define\)(.*);\?\s*$$/d' target/engine.quick.js > target/engine.js

dirty: target
	cat engine/GlShader.js engine/GlMatrixManager.js engine/Camera.js engine/GlShape.js engine/GlScene.js engine/GlTexture.js engine/GlVertices.js engine/engine.js > target/engine.dirty.js
	sed '/^\(require\|define\)(.*);\?\s*$$/d' target/engine.dirty.js > target/engine.js

tilemap:
	montage -geometry +0+0 resources/1.gif resources/2.gif resources/tiles_1.gif
	montage -geometry +0+0 resources/3.gif resources/4.gif resources/tiles_2.gif
	montage -geometry +0+0 -tile 1x2 resources/tiles_1.gif resources/tiles_2.gif resources/tiles_.gif
	convert resources/tiles_.gif resources/tiles.gif
	rm resources/tiles_*.gif

clean:
	rmdir target

server:
	python -m SimpleHTTPServer
