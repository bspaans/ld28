
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

clean:
	rmdir target

server:
	python -m SimpleHTTPServer
