
node_define('test_node_test_app', function(require) {

  var util = require('test_app/util'),
      main = require('test_app/index'),
      results;

  results = main.execute();
  util.log(results);

  util.log(results === 'app: 2+1=3;other gets cool' ? 'PASS' : 'FAIL');

  util.log('Require test_app test:');
  util.log(require('test_app') === main ? 'PASS' : 'FAIL');

});

