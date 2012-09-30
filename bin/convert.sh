#!/bin/sh

global=$1
globals=$(cat "$2")
sources=$(cat "$3")
exports=$(echo "$sources")
requires=$(echo "$sources")

add_to_exports() {
  add=$1
  exports=$(echo "$exports" | sed "s#^$defined_in.*#&:$add#")
}

global_exports=$(grep "\<$global\>[.[:alnum:]]* *=" $sources |
                 sed -e 's/ *=.*//' -e "s/:.*$global/:$global/")

for match in $global_exports
do
  defined_in=$(echo $match | cut -d : -f 1)
  global_export=$(echo $match | cut -d : -f 2)
  add_to_exports $global_export
done

for global in $globals
do
  printf '.'
  defined_in=$(grep "\<$global\>" $sources | head -n 1 | cut -d ':' -f 1)
  add_to_exports $global
done

echo ''

echo "$exports"

