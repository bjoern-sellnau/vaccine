vaccine=$vaccine_bin_dir/vaccine
source_dir=$1
app_name=$2
global_var=$3
dep_names=$4

test "X$app_name" = X && app_name=app_name
test "X$global_var" = X && global_var=$app_name
test "X$dep_names" = X && dep_names='dep1,dep2,dep3'

if test -d "$source_dir"
then
  files_list=$(find "$source_dir" -type f)
else
  files_list=$source_dir
fi
files_list=$(echo "$files_list" | grep -v '\<vaccine.*\.js$')

v=vaccines
test -d $v && mv $v old_vaccines

$vaccine configure "$app_name" --global "$global_var" --deps "$dep_names"

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
build vaccine_single_dep.js > $v/with_vaccine_single_dep.js
build vaccine_multiple_deps.js > $v/with_vaccine_multiple_deps.js
build vaccine_simple.js > $v/with_simple.js
build vaccine_simple_single_dep.js > $v/with_simple_single_dep.js
build vaccine_simple_multiple_deps.js > $v/with_simple_multiple_deps.js
build_without > $v/without_vaccine.js

cp "$v/original.js" "$v/with_minimal.js"
$vaccine inject "$v/with_minimal.js" --app "$app_name" --global "$global_var"


cd $v

original=$($vaccine built-size original.js)
without=$($vaccine built-size without_vaccine.js)
with_vaccine=$($vaccine built-size with_vaccine.js)
with_vaccine_single_dep=$($vaccine built-size with_vaccine_single_dep.js)
with_vaccine_multiple_deps=$($vaccine built-size with_vaccine_multiple_deps.js)
with_simple=$($vaccine built-size with_simple.js)
with_simple_single_dep=$($vaccine built-size with_simple_single_dep.js)
with_simple_multiple_deps=$($vaccine built-size with_simple_multiple_deps.js)
with_minimal=$($vaccine built-size with_minimal.js)

size_vaccine=$($vaccine built-size vaccine.js)
size_vaccine_single_dep=$($vaccine built-size vaccine_single_dep.js)
size_vaccine_multiple_deps=$($vaccine built-size vaccine_multiple_deps.js)
size_simple=$($vaccine built-size vaccine_simple.js)
size_simple_single_dep=$($vaccine built-size vaccine_simple_single_dep.js)
size_simple_multiple_deps=$($vaccine built-size vaccine_simple_multiple_deps.js)

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

comp_vaccine=$(compare --text "$size_vaccine" $with_vaccine $without)
comp_vaccine_single_dep=$(compare --text "$size_vaccine_single_dep" $with_vaccine_single_dep $without)
comp_vaccine_multiple_deps=$(compare --text "$size_vaccine_multiple_deps" $with_vaccine_multiple_deps $without)
comp_simple=$(compare --text "$size_simple" $with_simple $without)
comp_simple_single_dep=$(compare --text "$size_simple_single_dep" $with_simple_single_dep $without)
comp_simple_multiple_deps=$(compare --text "$size_simple_multiple_deps" $with_simple_multiple_deps $without)
comp_minimal=$(compare $with_minimal $original)

out() {
  type=$1
  text=$2
  min=$3
  gzip=$4
  gzip_percent=$5
  printf '%35s:  %4s %4s %4s %6s\n' "$type" $text $min $gzip $gzip_percent
}

out 'size types' text min gz 'gz-%'
echo ''
out 'vaccine.js' $size_vaccine -
out '(integrated) vaccine.js' $comp_vaccine
echo ''
out 'single_dep' $size_vaccine_single_dep -
out '(integrated) single_dep' $comp_vaccine_single_dep
echo ''
out 'multiple_deps' $size_vaccine_multiple_deps -
out '(integrated) multiple_deps' $comp_vaccine_multiple_deps
echo ''
out 'simple' $size_simple -
out '(integrated) simple' $comp_simple
echo ''
out 'simple_single_dep' $size_simple_single_dep -
out '(integrated) simple_single_dep' $comp_simple_single_dep
echo ''
out 'simple_multiple_deps' $size_simple_multiple_deps -
out '(integrated) simple_multiple_deps' $comp_simple_multiple_deps
echo ''
out 'minimal' $($vaccine built-size vaccine_minimal.js) -
out '(integrated) minimal' $comp_minimal

cd ..

rm -r $v
test -d old_vaccines && mv old_vaccines $v

exit 0
