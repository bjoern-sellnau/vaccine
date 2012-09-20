
vaccine=$vaccine_bin_dir/vaccine
source_dir=$1

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

build() {
  if test "X$2" = "Xdefine"
  then
    echo "(function() {var define = window.define;"
  else
    echo "(function() {"
  fi
  cat $files_list
  test "X$1" != 'Xwithout' && cat "$v/$1"
  echo "}());"
}

build vaccine.js > $v/with_vaccine.js
build vaccine_already_ordered.js > $v/with_ordered.js
build vaccine_absolute_require.js > $v/with_absolute_require.js
build vaccine_absolute_require_already_ordered.js > $v/with_absolute_require_ordered.js
build vaccine_minimal.js define > $v/with_minimal.js
build without define > $v/without_vaccine.js


out() {
  type=$1
  text=$2
  mini=$3
  gzip=$4
  printf '%45s:  %4s %4s %4s\n' "$type" $text $mini $gzip
}


cd $v

compare() {
  echo $(($1 - $4)) $(($2 - $5)) $(($3 - $6))
}

without=$($vaccine --size-built without_vaccine.js)
with=$($vaccine --size-built with_vaccine.js)
with_already_ordered=$($vaccine --size-built with_ordered.js)
with_absolute_require=$($vaccine --size-built with_absolute_require.js)
with_absolute_require_ordered=$($vaccine --size-built with_absolute_require_ordered.js)
with_minimal=$($vaccine --size-built with_minimal.js)

out 'size types' text mini gzip
echo ''
out 'vaccine.js' $($vaccine --size-built vaccine.js)
out '(integrated) vaccine.js' $(compare $with $without)
echo ''
out 'already_ordered' $($vaccine --size-built vaccine_already_ordered.js)
out '(integrated) already_ordered' $(compare $with_already_ordered $without)
echo ''
out 'absolute_require' $($vaccine --size-built vaccine_absolute_require.js)
out '(integrated) absolute_require' $(compare $with_absolute_require $without)
echo ''
out 'absolute_require_already_ordered' $($vaccine --size-built vaccine_absolute_require_already_ordered.js)
out '(integrated) absolute_require_already_ordered' $(compare $with_absolute_require_ordered $without)
echo ''
out 'minimal' $($vaccine --size-built vaccine_minimal.js)
out '(integrated) minimal' $(compare $with_minimal $without)

cd ..

rm -r $v
test -d old_vaccines && mv old_vaccines $v

