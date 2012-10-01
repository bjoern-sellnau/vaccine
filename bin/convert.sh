#!/bin/sh

global=$1
globals=$(cat "$2" | grep -v "^$global$")
sources=$(cat "$3")

all_globals=$(echo "$globals")
all_exports=$(echo "$sources" | sed 's/$/:/')
all_requires=$(echo "$sources" | sed 's/$/:/')
all_pullouts=$(echo "$sources" | sed 's/$/:/')

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

extract_values() {
  key=$(safe_re "$1")
  grep "^$key:" | sed -e 's/^[^:]*://' -e 's/:$//' | tr ':' '\n' |
      sort | uniq
}

# Exports

echo 'Determining Exports'

global_exports=$(grep "\<$global\>[.[:alnum:]]* *=" $sources |
    sed -e "s/\($global[.[:alnum:]]*\) *=.*/\1/" -e "s/:.*$global/:$global/")

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
  defined_line=$(echo "$all_exports" | grep ":$global_re:")
  defined_in=$(echo "$defined_line" | cut -d ':' -f 1)
  num=$(echo "$defined_in" | wc -l | sed 's/ //g')
  if test "$num" -gt 1
  then
    echo '' >&2
    echo defined_line: "$defined_line"
    echo global_re: "$global_re"
    echo "More than one ($num) definitions for $global! Using first:" >&2
    echo "$defined_in" | sed 's/^/> /' >&2
    defined_in=$(echo "$defined_in" | head -n 1)
  fi
  requires=$(grep "\<$global[^.[:alnum:]]" $sources | sed 1d | cut -d ':' -f 1)
  for requiring in $requires
  do
    if test "X$requiring" != "X$defined_in"
    then
      requiring_re=$(safe_re "$requiring")
      if ! $(echo "$all_requires" | grep -q "^$requiring_re.*:$defined_in")
      then
        all_requires=$(echo "$all_requires" |
                       append_value "$requiring" "$defined_in")
      fi
      all_pullouts=$(echo "$all_pullouts" |
                     append_value "$requiring" "$defined_in%$global")
    fi
  done
done


# Write to files

echo ''
echo 'Writing to files'

comment() {
  sed 's#^#// #'
}

for source in $sources
do
  exports=$(echo "$all_exports" | extract_values "$source")
  requires=$(echo "$all_requires" | extract_values "$source")
  pullouts=$(echo "$all_pullouts" | extract_values "$source")
  echo "Exports" | comment >> $source
  echo "$exports" | comment >> $source
  echo "" | comment >> $source
  echo "Requires" | comment >> $source
  echo "$requires" | comment >> $source
  echo "" | comment >> $source
  echo "" | comment >> $source
  echo "Pullouts" | comment >> $source
  echo "$pullouts" | comment >> $source
done
