convert_to=$1
app_name=$2
source_dir=$3

pop_dir() {
  current=$1
  if ! $(echo "$current" | grep -q '/')
  then
    printf '.'
  else
    echo $current | sed 's#/[^/]*$##'
  fi
}

make_relative() {
  remove_dir=$1
  back=$2
  source=$3
  if test "X$remove_dir" != 'X.'
  then
    sed -i '' -e "s#require(\(.\)$remove_dir[[:>:]]#require(\1$back#" "$source"
  fi
}

for source in $(find "$source_dir" -type f)
do
  module=$(echo "$source" | sed -e "s#^$source_dir/##" -e "s#^#$app_name/#" \
                                -e 's/\.js$//' -e 's#/$##')
  same_dir=$(pop_dir $module)
  make_relative $same_dir '.' "$source" $module
  back_one_dir=$(pop_dir $same_dir)
  make_relative $back_one_dir '..' "$source" $module
  back_two_dirs=$(pop_dir $back_one_dir)
  make_relative $back_two_dirs '../..' "$source" $module
done
