#!/bin/sh

global=$1
globals=$(cat "$2")
sources=$(cat "$3")

all_globals=$(echo "$globals")
all_exports=$(echo "$sources" | sed 's/$/:/')
all_requires=$(echo "$sources" | sed 's/$/:/')

safe_re() {
  echo "$1" | sed 's/\./\\./g'
}

append_value() {
  key=$(safe_re "$1")
  value=$2
  sed "s#^$key:.*#&$value:#"
}

add_to_exports() {
  all_exports=$(echo "$all_exports" | append_value "$defined_in" "$1")
}


# Exports

echo 'Determining Exports'

global_exports=$(grep "\<$global\>[.[:alnum:]]* *=" $sources |
                 sed -e 's/ *=.*//' -e "s/:.*$global/:$global/")

for match in $global_exports
do
  printf '.'
  defined_in=$(echo $match | cut -d : -f 1)
  global_export=$(echo $match | cut -d : -f 2)
  all_globals=$(echo "$all_globals"'
'"$global_export")
  add_to_exports $global_export
done

for global in $globals
do
  printf '.'
  defined_in=$(grep "\<$global\>" $sources | head -n 1 | cut -d ':' -f 1)
  add_to_exports $global
done

all_globals="$(echo "$all_globals" | sort | uniq)"


# Requires

echo ''
echo 'Determining Requires'

for global in $all_globals
do
  printf '.'
  global_re=$(safe_re "$global")
  defined_in=$(echo "$all_exports" | grep ":$global_re:" | cut -d ':' -f 1)
  num=$(echo "$defined_in" | wc -l | sed 's/ //g')
  if test "$num" -gt 1
  then
    echo '' >&2
    echo "More than one ($num) definitions for $global! Using first:" >&2
    echo "$defined_in" | sed 's/^/> /' >&2
    defined_in=$(echo "$defined_in" | head -n 1)
  fi
  requires=$(grep "\<$global[^.[:alnum:]]" $sources | sed 1d | cut -d ':' -f 1)
  for requiring in $requires
  do
    requiring_re=$(safe_re "$requiring")
    if ! $(echo "$all_requires" | grep -q "^$requiring_re.*:$defined_in")
    then
      all_requires=$(echo "$all_requires" | append_value "$requiring" "$defined_in")
    fi
  done
done

echo ''
echo "$all_requires"

