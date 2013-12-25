
JAVA_HOME=/usr/lib/jvm/java-7-openjdk-amd64
JAVA=${JAVA_HOME}/bin/java
PROJECT="one_minute_man"
RELEASE=1.0.0

default: build

target:
	mkdir -p target

build: target	
	rhino ext/r.js -o baseUrl=src name=engine out=target/engine.min.js

quick: target
	rhino ext/r.js -o baseUrl=src optimize=none name=engine out=target/engine.quick.js
	sed '/^\(require\|define\)(.*);\?\s*$$/d' target/engine.quick.js > target/engine.js

dirty: target
	cat src/Engine.js src/SceneLoader.js src/GlShader.js src/Timer.js src/CubeBuilder.js \
		src/ModelViewMatrixManager.js src/Camera.js src/GlScene.js src/GlTexture.js \
		src/GlVertices.js src/engine.js > target/engine.dirty.js
	sed '/^\(require\|define\)(.*);\?\s*$$/d' target/engine.dirty.js > target/engine.js
	python compileSite.py resources/index.template.html > index.html

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
	cat src/GlShader.js tests/GlShader.js >> tests/tests.js
	cat src/ModelViewMatrixManager.js tests/ModelViewMatrixManager.js >> tests/tests.js
	cat src/CubeBuilder.js tests/CubeBuilder.js >> tests/tests.js
	sed -i '/^\(require\|define\)(.*);\?\s*$$/d' tests/tests.js

scene: target
	cat src/CubeBuilder.js src/cubeCompiler.js > target/cubeCompiler.js
	cat resources/scene.json | rhino target/cubeCompiler.js | python compileScene.py resources/scene.json > target/scene.compiled.json
	rm target/cubeCompiler.js

release: dirty scene
	/bin/echo -e -n "var precompiledScenes = {};\nprecompiledScenes[\"resources/scene.json\"] = " | \
		cat - target/scene.compiled.json target/engine.js > target/${PROJECT}.${RELEASE}.js

clean:
	rmdir target

server:
	python -m SimpleHTTPServer

