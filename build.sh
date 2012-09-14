#!/bin/sh

file=test_built.js

echo "(function() {" > $file  # You may want to add a "use strict"; here too
cat test/* >> $file           # Note that vaccine.js is in the test directory.
echo "}());" >> $file

