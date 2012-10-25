#!/bin/sh
# build with: ./build.sh > public/vaccine.js
echo '(function() {'

# vaccine.js must NOT be in the source list.
source_dir='src'


for file in $(find $source_dir -type f)
do
  name=$(echo "$file" | sed -e "s#^$source_dir/##" -e 's/\.js//')
  echo "define('$name', function(require, exports, module) {"
  cat $file
  echo '});'
done

cat vaccine.js  # Must be after sources.
echo '}());'
