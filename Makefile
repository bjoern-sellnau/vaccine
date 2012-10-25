.PHONY: build vaccine.js

build:
	./build_templates.js
	./build.sh > public/vaccine.js

vaccine.js:
	bin/vaccine --name vaccine --main src/web.js --commonjs -s window -t vaccine.js

clean:
	git checkout build.sh vaccine.js
	rm -f vaccine_debug.js
	rm -f dev_server.js
	rm -f Makefile.example
