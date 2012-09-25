
define('test_app/main', function(require) {

  var counter = require('util/counter'),
      simple = require('./simple'),
      testIndex = require('./test_index'),
      complex = require('./complex');

  counter.reset();

  simple();
  testIndex();
  complex();

  var counts = counter.counts();

  console.log('--------------------');
  console.log('Passed: ' + counts.passed);
  console.log('Failed: ' + counts.failed);

});

