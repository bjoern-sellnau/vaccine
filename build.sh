#!/bin/sh

file=test_built.js

echo "(function() {" > $file
cat test/* >> $file         # Note that vaccine.js is in the test directory.
echo "}());" >> $file

