
define('util/counter', function(require, exports) {

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

