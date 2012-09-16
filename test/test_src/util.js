
define('test_app/counter', function(require, exports) {

  var passed,
      failed;

  exports.reset = function() {
    passed = failed = 0;
  };

  exports.passed = function() {
    passed += 1;
  };

  exports.failed = function() {
    failed += 1;
  };

  exports.counts = function() {
    return {passed: passed, failed: failed};
  };

});


define('test_app/util', function(require, e, module) {

  var counter = require('./counter');

  function assert(test, message) {
    if (test) {
      counter.passed();
    } else {
      counter.failed();
      console.log(message || 'Assertion failed');
      console.trace();
    }
  }

  assert.equal = function(test, expected, message) {
    var equal = test === expected;
    if (!equal) {
      console.log('' + test + ' !== ' + expected);
    }
    assert(equal, message);
  };


  function verifyCount(lower, upper, func) {
    var topCount = 0,
        bottomCount = 0;

    if (!func) {
      func = upper;
      upper = lower;
    }

    var msg = 'verifyCount failed on function: \n' + func;

    return function(require, exports, module) {
      topCount += 1;
      var ret = func(require, exports, module);
      bottomCount += 1;

      if (lower === upper) {
        assert.equal(topCount, lower, msg);
      } else {
        assert(topCount >= lower && topCount <= upper,
              topCount + ' not >= ' + lower + ' and <= ' + upper + '\n' + msg);
      }
      assert.equal(bottomCount, 1, msg);
      return ret;
    };
  }

  module.exports = {
    assert: assert,
    verifyCount: verifyCount,
    counter: counter,
  };

});

