
vaccine_bin_dir=$1
vaccine=$vaccine_bin_dir/vaccine
source_dir=$2

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
build vaccine_minimal.js define > $v/with_minimal_vaccine.js
build without define > $v/without_vaccine.js


out() {
  type=$1
  text=$2
  mini=$3
  gzip=$4
  printf '%30s:  %4s %4s %4s\n' "$type" $text $mini $gzip
}


cd $v

out sizes text mini gzip
out 'vaccine.js' $($vaccine --size-built vaccine.js)
out 'vaccine.js integrated' $($vaccine --size-built with_vaccine.js without_vaccine.js)
out 'minimal' $($vaccine --size-built vaccine_minimal.js)
out 'minimal integrated' $($vaccine --size-built with_minimal_vaccine.js without_vaccine.js)

cd ..

rm -r $v
test -d old_vaccines && mv old_vaccines $v

