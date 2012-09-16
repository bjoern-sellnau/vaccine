
var util = require('./util'),
    execute = require('test_app/execute'),
    results;

results = execute.execute();
util.log(results);

util.log(results === 'app: 2+1=3;other gets cool' ? 'PASS' : 'FAIL');

exports.isA = 'success';

window.setTimeout(function() {
  util.log('Require test_app test:');
  util.log(require('test_app').isA === 'success' ? 'PASS' : 'FAIL');
}, 60);

