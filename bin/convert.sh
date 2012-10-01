#!/bin/sh

app_name=$1
global=$2
source_dir=$3
globals=$4
sources=$(cat "$5")

all_globals=_vaccine_all_globals
all_exports=_vaccine_all_exports
all_requires=_vaccine_all_requires
all_pullouts=_vaccine_all_pullouts
all_require_vars=_vaccine_all_require_vars
all_pullout_vars=_vaccine_all_pullout_vars
printf '' > $all_exports
printf '' > $all_requires
printf '' > $all_pullouts
cp $globals $all_globals

safe_re() {
  echo "$1" | sed 's/\./\\./g'
}

sort_uniq() {
  var_name=$1
  eval "old_file_name=\$$var_name"
  new_file_name="$old_file_name"_sort_uniq
  sort $old_file_name | uniq > $new_file_name
  eval $var_name=$new_file_name
}


# Exports

# Find the public api (e.g. my_app_global.some_property.some_other_property)
grep "\<$global\>[.[:alnum:]]* *=" $sources |
    sed -e "s/\($global[.[:alnum:]]*\) *=.*/\1/" -e "s/:.*$global/:$global/" >> $all_exports

cat $all_exports | cut -d : -f 2 >> $all_globals

for global in $(grep -v "^$global$" "$globals")
do
  defined_in=$(grep "\<$global\>" $sources | head -n 1 | cut -d ':' -f 1)
  echo "$defined_in:$global" >> $all_exports
done

sort_uniq all_globals
sort_uniq all_exports


# Requires

for global in $(cat $all_globals)
do
  global_re=$(safe_re "$global")
  defined_in=$(grep ":$global_re$" $all_exports | cut -d ':' -f 1)
  num=$(echo "$defined_in" | wc -l | sed 's/ //g')
  if test "$num" -gt 1
  then
    echo '' >&2
    echo "$global defined $num times. Using first definition:" >&2
    echo "$defined_in" | sed 's/^/> /' >&2
    defined_in=$(echo "$defined_in" | head -n 1)
  fi
  def_module=$(echo "$defined_in" | sed -e 's/\/index.js//' \
               -e 's/\.js$//' -e "s#:$source_dir/#:#" -e "s#:#:$app_name/#")
  defined_in_re=$(safe_re "$defined_in")
  requires=$(grep "\<$global[^.[:alnum:]]" $sources | sed 1d | cut -d ':' -f 1 |
             grep -v "^$defined_in_re$" | sed "s#\$#:$def_module#")
  echo "$requires" >> $all_requires
  echo "$requires" | sed "s/$/%$global/" >> $all_pullouts
done

sort_uniq all_requires
sort_uniq all_pullouts


# Vars

sed -e "s/:\(.*\)/& = require('\1'),/" \
    -e 's#:[^=]*/#:    #' $all_requires > $all_require_vars

sed 's#:.*/\(.*\)%\(.*\)#:    \2 = \1.\2,#' $all_pullouts > $all_pullout_vars


# Write to files

extract_values() {
  from=$1
  key=$(safe_re "$2")
  grep "^$key:" $from | sed -e 's/^[^:]*://' -e '/^$/d'
}

for source in $sources
do
  exports=$(extract_values $all_exports "$source")
  requires=$(extract_values $all_require_vars "$source")
  pullouts=$(extract_values $all_pullout_vars "$source")
  lines=$(echo "$requires"'
'"$pullouts" | sed '/^ *$/d' | sed -e '1s/^    /var /' -e '$s/,/;/')
  test "X$lines" != X && echo "$lines" >> $source
done

rm _vaccine_all_*
