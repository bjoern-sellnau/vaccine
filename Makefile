.PHONY: build vaccine.js

build:
	./build_templates.js
	./build.sh > public/vaccine.js

vaccine.js:
	bin/vaccine --name vaccine --main src/web.js --commonjs -s window -t build.sh -t vaccine.js
	@sed -i '' -e 's/build\.sh > vaccine\.js/build.sh > public\/vaccine.js/' build.sh

clean:
	git checkout build.sh vaccine.js
	rm -f vaccine_debug.js
	rm -f dev_server.js
	rm -f Makefile.example
