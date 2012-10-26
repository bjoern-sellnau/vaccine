.PHONY: build vaccine.js

build:
	./build.sh > public/vaccine.js

release:
	./release.sh

vaccine.js:
	bin/vaccine --name vaccine --main src/web.js --commonjs -s window -t vaccine.js

clean:
	git checkout build.sh vaccine.js
	rm -f vaccine_dev.js
	rm -f dev_server.js
	rm -f Makefile.example
