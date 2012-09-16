
.PHONY: all test test-node pre-test configure strip-loader build minimal size

all: | configure strip-loader build minimal size

test: pre-test
	cd test; node dev_server_standalone.js

test-node: pre-test
	cd test; node dev_server_standalone_node.js

pre-test:
	./configure
	printf '\n\n!!!\nOpen localhost:3000 in a browser.\n!!!\n\n'

configure:
	./configure

build:
	cd test; ./build > test_built.js
	cd test; ./build_node > test_built_node.js

strip-loader:
	cat vaccine_loader.js | sed -e '/VACCINE_LOADER_START/,/VACCINE_LOADER_END/d' -e 's/^  //' > vaccine.js

minimal:
	cat vaccine.js | sed -e '1,/VACCINE_MINIMAL_START/d' -e '/VACCINE_MINIMAL_END/,$$d' -e 's/^  //' > vaccine_minimal.js

size:
	sh size_test.sh
