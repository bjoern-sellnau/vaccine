
vaccine=$vaccine_bin_dir/vaccine
source_dir=$1
app_name=$2
global_var=$3

test "X$app_name" = X && app_name=app_name
test "X$global_var" = X && global_var=$app_name

if test -d "$source_dir"
then
  files_list=$(find "$source_dir" -type f)
else
  files_list=$source_dir
fi
files_list=$(echo "$files_list" | grep -v 'vaccine.*\.js')

v=vaccines
test -d $v && mv $v old_vaccines

$vaccine --app my_app

short_define() {
  sed 's/define(/d(/g'
}

cat $files_list > "$v/original.js"
cat "$v/original.js" | short_define > "$v/original_short_define.js"

build() {
  echo "(function() {'use strict';"
  cat "$v/original.js"
  cat "$v/$1"
  echo "}());"
}

build_without() {
  echo "(function() {'use strict';"
  cat "$v/original_short_define.js"
  echo "}());"
}

build vaccine.js > $v/with_vaccine.js
build vaccine_already_ordered.js > $v/with_ordered.js
build vaccine_absolute_require.js > $v/with_absolute_require.js
build vaccine_absolute_require_already_ordered.js > $v/with_absolute_require_ordered.js
build_without > $v/without_vaccine.js

cp "$v/original.js" "$v/with_minimal.js"
$vaccine --inject "$v/with_minimal.js" --app "$app_name" --global "$global_var"


cd $v

original=$($vaccine --size-built original.js)
without=$($vaccine --size-built without_vaccine.js)
with=$($vaccine --size-built with_vaccine.js)
with_already_ordered=$($vaccine --size-built with_ordered.js)
with_absolute_require=$($vaccine --size-built with_absolute_require.js)
with_absolute_require_ordered=$($vaccine --size-built with_absolute_require_ordered.js)
with_minimal=$($vaccine --size-built with_minimal.js)

size_vaccine=$($vaccine --size-built vaccine.js)
size_already_ordered=$($vaccine --size-built vaccine_already_ordered.js)
size_absolute_require=$($vaccine --size-built vaccine_absolute_require.js)
size_absolute_require_ordered=$($vaccine --size-built vaccine_absolute_require_already_ordered.js)

compare() {
  if test "X$1" = "X--text"
  then
    shift
    text=$(echo "$1" | cut -d ' ' -f 1)
    shift
  else
    text=$(($1 - $4))
  fi
  percent=$(awk 'BEGIN{ printf "%.2f%%", (100 * ('$3' - '$6') / '$6') }')
  echo $text $(($2 - $5)) $(($3 - $6)) $percent
}

comp_vaccine=$(compare --text "$size_vaccine" $with $without)
comp_already_ordered=$(compare --text "$size_already_ordered" $with_already_ordered $without)
comp_absolute_require=$(compare --text "$size_absolute_require" $with_absolute_require $without)
comp_absolute_require_ordered=$(compare --text "$size_absolute_require_ordered" $with_absolute_require_ordered $without)

out() {
  type=$1
  text=$2
  min=$3
  gzip=$4
  gzip_percent=$5
  printf '%33s:  %4s %4s %4s %6s\n' "$type" $text $min $gzip $gzip_percent
}

out 'size types' text min gz 'gz-%'
echo ''
out 'vaccine.js' $size_vaccine -
out '(integrated) vaccine.js' $comp_vaccine
echo ''
out 'already_ordered' $size_already_ordered -
out '(integrated) already_ordered' $comp_already_ordered
echo ''
out 'absolute_require' $size_absolute_require -
out '(integrated) absolute_require' $comp_absolute_require
echo ''
out 'absolute_..._ordered' $size_absolute_require_ordered -
out '(integrated) absolute_..._ordered' $comp_absolute_require_ordered
echo ''
out 'minimal' $($vaccine --size-built vaccine_minimal.js) -
out '(integrated) minimal' $(compare $with_minimal $original)

cd ..

rm -r $v
test -d old_vaccines && mv old_vaccines $v

