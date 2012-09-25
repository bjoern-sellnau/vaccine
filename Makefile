
.PHONY: configure test build size

all: configure size

size:
	bin/vaccine size test/test_src

release:
	src/configure_all --release

configure:
	src/configure_all

test: pre-test
	cd test; node dev_server_standalone.js

test-node: pre-test
	cd test; node dev_server_standalone_node.js

pre-test: | configure build-test
	@printf '\n\n!!!\nOpen localhost:3000 in a browser.\n!!!\n\n'

build-test:
	cd test; ./build_util > test_lib/util.js
	cd test; ./build > test_already_built.js
	cd test; ./build_node > test_already_built_node.js

