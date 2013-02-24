.PHONY: test build

test:
	@echo Open localhost:5000/test.html in a browser
	foreman start

build:
	foreman run ./build
