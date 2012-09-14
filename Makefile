
.PHONY: all build minimal

all: | build minimal size

build:
	sh build.sh

minimal:
	cat vaccine.js | sed -e '1,/MINIMAL-VACCINE-START/d' -e '/MINIMAL-VACCINE-END/,$$d' -e 's/^  //' > minimal-vaccine.js

size:
	sh size-test.sh
