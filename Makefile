
.PHONY: all build minimal

all: | build minimal size

build:
	./build > test_built.js

minimal:
	cat vaccine.js | sed -e '1,/MINIMAL-VACCINE-START/d' -e '/MINIMAL-VACCINE-END/,$$d' -e 's/^  //' > vaccine_minimal.js

size:
	sh size_test.sh
