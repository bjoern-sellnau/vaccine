
var util = require('test_app/util'),
    app = require('test_app'),
    results;

results = app.execute();
util.log(results);

util.log(results === 'app: 2+1=3;other gets cool' ? 'PASS' : 'FAIL');

