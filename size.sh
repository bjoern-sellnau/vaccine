#!/bin/sh

file=$1

size() {
  wc -c $1 | sed 's/^ *//' | cut -d ' ' -f 1
}
uglifyjs $file > $file.min
gzip -c $file.min > $file.min.gz

printf '%10s %s\n' $(size $file) plaintext
printf '%10s %s\n' $(size $file.min) minified
printf '%10s %s\n' $(size $file.min.gz) gzipped

rm $file.min
rm $file.min.gz

