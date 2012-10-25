.PHONY: build vaccine.js

build:
	./build.sh > public/vaccine.js

vaccine.js:
	bin/vaccine --name vaccine --main src/vaccine.js --commonjs -s window -t build.sh -t vaccine.js
	@sed -i '' -e 's/build\.sh > vaccine\.js/build.sh > public\/vaccine.js/' build.sh
