#!/bin/sh
echo '(function() {'

# vaccine.js must NOT be in the source list.
source_dir='src'

# Put web.js first, for better debugging
sources="src/web.js $(find $source_dir -type f | sort | grep -v 'src/web\.js')"


for file in $sources
do
  name=$(echo "$file" | sed -e "s#^$source_dir/##" -e 's/\.js//')
  echo "define('$name', function(require, exports, module) {"
  if test "$file" = "src/web.js"
  then
    sed '1,2d' $file
  else
    cat $file
  fi
  echo '});'
done

# templates.js
echo "define('templates', function(require, exports, module) {"
./build_templates.js
echo '});'

cat vaccine.js  # Must be after sources.
echo '}());'
