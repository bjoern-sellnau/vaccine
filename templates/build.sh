    #!/bin/sh
    # build with: sh build.sh > $-- output --$
    echo ';(function(vaccineRoot) {$-- use_strict ? '"use strict";' : '' --$'

??????????????????????????????????????????? (commonjs || define('optional_id'))
    # vaccine.js must NOT be in the source list.
    source_dir='$-- source_dir --$'


    for file in $(find $source_dir -type f | sort)
    do
      name=$(echo "$file" | sed -e "s#^$source_dir/##" -e 's/\.js//')
  ?????????????????????????????????????????????????????????????? (commonjs)
      echo "define('$name', function(require, $-- exports('module') ? 'exports, module' : 'exports' --$) {"
      cat $file
      echo '});'
  :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
      sed "s#define(\([^'\"]\)#define('$name', \1#" $file
  /////////////////////////////////////////////////////////////////////////
    done
:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
    # vaccine.js must NOT be in the source list.
    cat $(find $-- source_dir --$ -type f | sort)
///////////////////////////////////////////////////////////////////////////////

    cat vaccine.js  # Must be after sources.
    echo '}(this));'
