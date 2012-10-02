convert_to=$1
app_name=$2
source_dir=$3

safe_re() {
  echo "$1" | sed 's/\./\\./g'
}

get_module() {
  echo "$source" | sed -e "s#^$source_dir/##" -e "s#^#$app_name/#" \
                       -e 's/\.js$//' -e 's#/$##'
}

pop_dir() {
  current=$1
  if ! $(echo "$current" | grep -q '/')
  then
    printf ''
  else
    echo $current | sed 's#/[^/]*$##'
  fi
}

switch_relative() {
  from=$1
  to=$2
  source=$3
  if test "X$from" != X -a "X$to" != X
  then
    from_re=$(safe_re "$from")
    sed -i '' -e "s#require(\(.\)$from_re\([\"'/]\)#require(\1$to\2#" "$source"
  fi
}

for source in $(find "$source_dir" -type f)
do
  module=$(get_module "$source")
  same_dir=$(pop_dir $module)
  back_one_dir=$(pop_dir $same_dir)
  back_two_dirs=$(pop_dir $back_one_dir)
  if test "X$convert_to" = Xrelative
  then
    switch_relative "$same_dir" '.' "$source"
    switch_relative "$back_one_dir" '..' "$source"
    switch_relative "$back_two_dirs" '../..' "$source"
  else
    switch_relative '../..' "$back_two_dirs" "$source"
    switch_relative '..' "$back_one_dir" "$source"
    switch_relative '.' "$same_dir" "$source"
  fi
done
