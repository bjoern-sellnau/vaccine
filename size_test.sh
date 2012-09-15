
echo "(function() {var define = window.define;" > test_without_vaccine.js
cat test/test.js >> test_without_vaccine.js
echo "}());" >> test_without_vaccine.js
echo "(function() {var define = window.define;" > test_with_minimal_vaccine.js
cat test/test.js >> test_with_minimal_vaccine.js
cat minimal-vaccine.js >> test_with_minimal_vaccine.js
echo "}());" >> test_with_minimal_vaccine.js


echo ''
echo Minimal standalone:
sh size.sh minimal-vaccine.js

echo ''
echo Minimal integrated:
sh size.sh test_with_minimal_vaccine.js test_without_vaccine.js

echo ''
echo Full standalone:
sh size.sh vaccine.js

echo ''
echo Full integrated:
sh size.sh test_built.js test_without_vaccine.js

rm test_without_vaccine.js
rm test_with_minimal_vaccine.js
