
.PHONY: test configure build size

all: | build size

build: | configure build-test

test: pre-test
	cd test; node dev_server_standalone.js

test-node: pre-test
	cd test; node dev_server_standalone_node.js

pre-test: | configure build-util
	printf '\n\n!!!\nOpen localhost:3000 in a browser.\n!!!\n\n'

sources: strip-node strip-loader minimal

configure: | sources
	./configure

build-test: build-util
	cd test; ./build > test_built.js
	cd test; ./build_node > test_built_node.js

build-util:
	cd test; ./build_util > test_lib/util.js


strip-node:
	sed '/DEV_SERVER_EXPRESS_NODE_START/,/DEV_SERVER_EXPRESS_NODE_END/d' dev_server_express_node.js > dev_server_express.js

strip-loader:
	sed -e '/VACCINE_LOADER_START/,/VACCINE_LOADER_END/d' -e 's/^  //' vaccine_loader.js > vaccine.js

minimal:
	sed -e '1,/VACCINE_MINIMAL_START/d' -e '/VACCINE_MINIMAL_END/,$$d' -e 's/^  //' vaccine.js > vaccine_minimal.js

size:
	sh size_test.sh
