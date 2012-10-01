#!/bin/sh

app_name=$1
global=$2
source_dir=$3
globals=$(cat "$4" | grep -v "^$global$")
sources=$(cat "$5")

all_globals=$(echo "$globals")
all_exports=vaccine_all_exports
all_requires=vaccine_all_requires
all_pullouts=vaccine_all_pullouts
printf '' > $all_exports
printf '' > $all_requires
printf '' > $all_pullouts

safe_re() {
  echo "$1" | sed 's/\./\\./g'
}


# Exports

# Find the public api (e.g. my_app_global.some_property.some_other_property)
grep "\<$global\>[.[:alnum:]]* *=" $sources |
    sed -e "s/\($global[.[:alnum:]]*\) *=.*/\1/" -e "s/:.*$global/:$global/" >> $all_exports

all_globals=$(echo "$all_globals"'
'"$(cat $all_exports | cut -d : -f 2)")

for global in $globals
do
  defined_in=$(grep "\<$global\>" $sources | head -n 1 | cut -d ':' -f 1)
  echo "$defined_in:$global" >> $all_exports
done

all_globals="$(echo "$all_globals" | sort | uniq)"


# Requires

for global in $all_globals
do
  global_re=$(safe_re "$global")
  defined_in=$(cat $all_exports | grep ":$global_re$" | cut -d ':' -f 1)
  num=$(echo "$defined_in" | wc -l | sed 's/ //g')
  if test "$num" -gt 1
  then
    echo '' >&2
    echo "$global defined $num times. Using first definition:" >&2
    echo "$defined_in" | sed 's/^/> /' >&2
    defined_in=$(echo "$defined_in" | head -n 1)
  fi
  requires=$(grep "\<$global[^.[:alnum:]]" $sources | sed 1d | cut -d ':' -f 1)
  for requiring in $requires
  do
    if test "X$requiring" != "X$defined_in"
    then
      echo "$requiring:$defined_in" >> $all_requires
      echo "$requiring:$defined_in%$global" >> $all_pullouts
    fi
  done
done


# Write to files

extract_values() {
  from=$1
  key=$(safe_re "$2")
  grep "^$key:" $from | sed 's/^[^:]*://' | sed '/^$/d' | sort | uniq
}

module_names() {
  sed -e "s#^$source_dir/##" -e 's/\.js//' -e "s#^#$app_name/#"
}

for source in $sources
do
  exports=$(extract_values $all_exports "$source")
  requires=$(extract_values "$all_requires" "$source" | module_names |
             sed -e "s/.*/& = require('&'),/" -e 's#[^=]*/#    #')
  pullouts=$(extract_values "$all_pullouts" "$source" |
             sed 's#.*/\(.*\)\.js%\(.*\)#    \2 = \1.\2,#')
  lines=$(echo "$requires"'
'"$pullouts" | sed '/^ *$/d' | sed -e '1s/^    /var /' -e '$s/,/;/')
  test "X$lines" != X && echo "$lines" >> $source
done

rm $all_exports
rm $all_requires
rm $all_pullouts
