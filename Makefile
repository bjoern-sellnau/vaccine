
.PHONY: all configure build minimal size

all: | configure build minimal size

configure:
	./configure

build:
	cd test; ./build > test_built.js
	cd test; ./build_node > test_built_node.js

minimal:
	cat vaccine.js | sed -e '1,/MINIMAL-VACCINE-START/d' -e '/MINIMAL-VACCINE-END/,$$d' -e 's/^  //' > vaccine_minimal.js

size:
	sh size_test.sh
