
./configure --app test_app --main ../test/test_src/main
cd vaccines
./build > test_built.js

files=$(ls ../test/test_src/* | grep -v vaccine.js)
echo "(function() {var define = window.define;" > test_without_vaccine.js
cat $files >> test_without_vaccine.js
echo "}());" >> test_without_vaccine.js
echo "(function() {var define = window.define;" > test_with_minimal_vaccine.js
cat $files >> test_with_minimal_vaccine.js
cat vaccine_minimal.js >> test_with_minimal_vaccine.js
echo "}());" >> test_with_minimal_vaccine.js


echo ''
echo Minimal standalone:
../size.sh vaccine_minimal.js

echo ''
echo Minimal integrated:
../size.sh test_with_minimal_vaccine.js test_without_vaccine.js

echo ''
echo Full standalone:
../size.sh vaccine.js

echo ''
echo Full integrated:
../size.sh test_built.js test_without_vaccine.js

cd ..
rm -r vaccines

