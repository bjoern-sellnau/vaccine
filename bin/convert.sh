#!/bin/sh

warn() {
  echo "$1" >&2
}

app_name=$1
global=$2
source_dir=$3
globals=$4
sources=$(cat "$5")

all_globals=_vaccine_all_globals
all_exports=_vaccine_all_exports
all_module_exports=_vaccine_all_module_exports
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

# Module.exports
sed 's/:.*//' $all_exports | uniq -u > $all_module_exports


# Requires

to_module() {
  echo "$1" | sed -e 's/\/index.js//' -e 's/\.js$//' \
                  -e "s#:$source_dir/#:#" -e "s#:#:$app_name/#"
}

for global in $(cat $all_globals)
do
  global_re=$(safe_re "$global")
  defined_in=$(grep ":$global_re$" $all_exports | cut -d ':' -f 1)
  num=$(echo "$defined_in" | wc -l | sed 's/ //g')
  if test "$num" -ne 1
  then
    warn "$global defined $num times. Using first definition:"
    warn $(echo "$defined_in" | sed 's/^/> /')
    defined_in=$(echo "$defined_in" | head -n 1)
  fi
  def_module=$(to_module "$defined_in")
  defined_in_re=$(safe_re "$defined_in")
  if grep -q "^$defined_in_re$" $all_module_exports
  then
    module_exports=true
    var=$global
  else
    module_exports=false
    var=$(echo "$def_module" | sed 's/.*\///')
    if test "X$var" = "X$global"
    then
      warn "$global (defined in $defined_in) conflicts with require var name"
      var="require_$var"
    fi
  fi
  requires=$(grep "\<$global[^.[:alnum:]]" $sources | cut -d ':' -f 1 |
             grep -v "^$defined_in_re$" | sed "s#\$#:$var:$def_module#")
  echo "$requires" >> $all_requires
  if test "X$module_exports" != Xtrue
  then
    echo "$requires" | sed "s/$/:$global/" >> $all_pullouts
  fi
done

sort_uniq all_requires
sort_uniq all_pullouts


# Vars

sed -e "s/:\(.*\):\(.*\)$/:    \1 = require('\2'),/" \
    $all_requires > $all_require_vars

sed 's/:\(.*\):.*:\(.*\)/:    \2 = \1.\2,/' $all_pullouts > $all_pullout_vars


# Write to files

extract_values() {
  from=$1
  key=$(safe_re "$2")
  grep "^$key:" $from | sed -e 's/^[^:]*://' -e '/^$/d'
}


for source in $sources
do
  source_copy="${source}_vaccine_copy"
  def_module=$(to_module "$source")

  exports=$(extract_values $all_exports "$source")
  requires=$(extract_values $all_require_vars "$source")
  pullouts=$(extract_values $all_pullout_vars "$source")
  required_by=$(grep ":$def_module$" $all_requires | cut -d ':' -f 1 |
                sed 's#^#// - #')

  lines=$(echo "$requires"'
'"$pullouts" | sed '/^ *$/d' | sed -e '1s/^    /var /' -e '$s/,/;/')

  # Write exports in file
  num_exports=$(echo "$exports" | wc -l | sed 's/ //g')
  if test "$num_exports" -gt 0
  then
    if test "$num_exports" -eq 1
    then
      global="$exports"
      sed -e "s/function *$global(/module.exports = exports = function(/" \
          -e "/[[:<:]]$global *= *{/d" \
          -e "s/$global *=/module.exports = exports =/" \
          -e "s/[[:<:]]$global[[:>:]]/exports/g" "$source" > "$source_copy"
    else
      cp "$source" "$source_copy"
      for global in $exports
      do
        sed -i '' -e "s/function *$global(/$global = function(/" \
            -e "s/[[:<:]]$global[[:>:]]/exports.$global/g" "$source_copy"
      done
    fi
    sed -i '' -e "s/var *module\.exports[[:>:]]/module.exports/" \
        -e "s/var *exports[[:>:]]/exports/" "$source_copy"
  else
    cp "$source" "$source_copy"
  fi

  # Actually write to the source file
  if test "X$required_by" != X
  then
    echo '// REQUIRED_BY START' > $source
    echo "$required_by" >> $source
    echo '// REQUIRED_BY END' >> $source
  else
    printf '' > $source
  fi
  if test "X$lines" != X
  then
    echo "$lines" >> $source
  fi
  cat "$source_copy" >> "$source"

  rm "$source_copy"
done

rm _vaccine_all_*
