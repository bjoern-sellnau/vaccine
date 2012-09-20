#!/bin/sh

file=$1
compare=$2

size() {
  a=$(single_size $file$1)
  if test "X$compare" = "X"
  then
    echo $a
  else
    b=$(single_size $compare$1)
    echo $(($a - $b))
  fi
}

single_size() {
  wc -c $1 | sed 's/^ *//' | cut -d ' ' -f 1
}

make_min() {
  uglifyjs $1 > $1.min
  gzip -n -9 -c $1.min > $1.min.gz
}
make_min $file
if test "X$compare" != "X"
then
  make_min $compare
fi

plaintext=$(size '')
minified=$(size .min)
gzipped=$(size .min.gz)
echo $plaintext $minified $gzipped

rm $file.min
rm $file.min.gz
if test "X$compare" != "X"
then
  rm $compare.min
  rm $compare.min.gz
fi

