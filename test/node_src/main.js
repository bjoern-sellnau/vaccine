
var util = require('test_app/util'),
    execute = require('test_app/execute'),
    results;

results = execute.execute();
util.log(results);

util.log(results === 'app: 2+1=3;other gets cool' ? 'PASS' : 'FAIL');

