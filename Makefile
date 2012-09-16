
.PHONY: all test test-node pre-test configure build minimal size

all: | configure build minimal size

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

minimal:
	cat vaccine.js | sed -e '1,/MINIMAL-VACCINE-START/d' -e '/MINIMAL-VACCINE-END/,$$d' -e 's/^  //' > vaccine_minimal.js

size:
	sh size_test.sh
