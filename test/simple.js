
var failed = 0,
    passed = 0;

function assert(assertion) {
  if (assertion) {
    passed += 1;
  } else {
    failed += 1;
  }
}

define('make the global vaccine', function() {});


define('module/with/no/dependencies', function(require, exports) {
  window.cool = 'yep';
  exports.returns = 'an object';
});

assert(window.cool === 'yep');


define('in order define', function(require) {
  var main = require('module/with/no/dependencies');
  assert(main.returns === 'an object');
});


////////
// Out Of Order

define('single out of order define', function(require) {
  var defBelow = require('defined below');

  window.outOfOrder = 'success';
  assert(defBelow && defBelow() === 'cool');
});

assert(!window.outOfOrder);

define('defined below', function(require, exports, module) {
  module.exports = function() { return 'cool'; };
});

assert(window.outOfOrder === 'success');


////////
// Relative require

define('module/with/relative/require', function(require) {
  var main = require('../no/dependencies');
  window.relativeRequire = main && main.returns;
});

assert(window.relativeRequire === 'an object');

