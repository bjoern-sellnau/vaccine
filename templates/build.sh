    #!/bin/sh
    # build with: ./build.sh > $-- name --$.js
    echo '(function() {$-- useStrict ? '"use strict";' : '' --$'

???????????????????????????????????????????????????????????????????? (commonJS)
    # vaccine.js must NOT be in the source list.
    source_dir='$-- sourceDir --$'


    for file in $(find $source_dir -type f)
    do
      name=$(echo "$file" | sed -e "s#^$source_dir/##" -e 's/\.js//')
      echo "define('$name', function(require, $-- exprts('module') ? 'exports, module' : 'exports' --$) {"
      cat $file
      echo '});'
    done
:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
    cat $(find $-- sourceDir --$ -type f)   # vaccine.js must NOT be in the source list.
///////////////////////////////////////////////////////////////////////////////

    cat vaccine.js  # Must be after sources.
    echo '}());'
