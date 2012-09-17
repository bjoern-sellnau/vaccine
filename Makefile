
.PHONY: configure test build size

all: | configure size

release:
	src/configure_all --release

configure:
	src/configure_all

test: pre-test
	cd test; node dev_server_standalone.js

test-node: pre-test
	cd test; node dev_server_standalone_node.js

pre-test: | configure build-util
	printf '\n\n!!!\nOpen localhost:3000 in a browser.\n!!!\n\n'

build-test: build-util
	cd test; ./build > test_built.js
	cd test; ./build_node > test_built_node.js

build-util:
	cd test; ./build_util > test_lib/util.js

size:
	sh size_test.sh

