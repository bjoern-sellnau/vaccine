
var passedAssertions = 0,
    failedAssertions = 0;

function assert(test, message) {
  if (test) {
    passedAssertions += 1;
  } else {
    failedAssertions += 1;
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

//////////////////////////////////////////////////
// Testing on, get, and set

// Call a single define, as this is needed to set the
// global _vaccine

define('make the global _vaccine', function() {});

assert.equal(_vaccine.get('undef'), undefined);

_vaccine.set('set test', 'set test passed?');
assert.equal(_vaccine.get('set test'), 'set test passed?');

_vaccine.on('pancake', function() { window.syrup = true; });

_vaccine.set('waffle', 'hmm');
assert(!window.syrup);
_vaccine.set('pancake');
assert(window.syrup);


//////////////////////////////////////////////////
// Simple dependencies

// Don't be using a global define! I'm using it here just to simplify
// testing.

define('no dependencies', function(require, exports) {
  window.cool = 'yep';
  exports.returns = 'an object';
});

assert.equal(window.cool, 'yep');


define('in order define', function(require) {
  var main = require('no dependencies');
  assert.equal(main.returns, 'an object');
});

// This function should have actually been called twice,
// but only gotten to the end once (exception thrown the first
// time as 'defBelow' was not defined)
define('single out of order define', verifyCount(2, function(require) {
  var defBelow = require('defined below');

  assert.equal(defBelow(), 'cool');
}));

define('defined below', function(require, exports, module) {
  module.exports = function() { return 'cool'; };
});


//////////////////////////////////////////////////
// More complex out of order test

// Called three or four times.
// Current implementation gets called 4 times
define('out of order 1', verifyCount(3, 4, function(require) {
  var ooo2 = require('out of order 2'),
      ooo3 = require('ooo3'),
      ooo5 = require('ooo5');

  window.ooo1 = true;
  assert.equal(ooo2.phrase, 'pair');
  assert.equal(ooo3.phrase, 'is the magic number');
  assert.equal(ooo5.phrase, 'is a dive');
}));

// Twice, failing only once for ooo4
define('out of order 2', verifyCount(2, function(require, exports, module) {
  var ooo4 = require('ooo4');

  assert.equal(ooo4.phrase, 'of a kind');
  module.exports = {phrase: 'pair'};
}));

define('ooo3', verifyCount(2, function(require, exports) {
  var ooo2 = require('out of order 2');
  assert.equal(ooo2.phrase, 'pair');
  exports.phrase = 'is the magic number';
}));

define('ooo4', function(require, exports) {
  exports.phrase = 'of a kind';
});

// Make sure ooo5 triggers ooo1 to define
assert(!window.ooo1);
define('ooo5', function(require, exports) {
  exports.phrase = 'is a dive';
});
assert.equal(window.ooo1, true);


//////////////////////////////////////////////////
// Test catching exceptions

try {
  define('exceptional 1', function(require) {
    require('exceptional 2');
  });
} catch (e) {
  assert(false, 'Should never throw not defined exceptions');
}
define('exceptional 2', function() {});

try {
  define('exceptional 3', function(require) {
    throw 'My bad...';
  });
  assert(false, 'Should rethrow other exceptions');
} catch (e) {
  assert.equal(e, 'My bad...', 'Should not modify rethrown exceptions');
}


//////////////////////////////////////////////////
// Testing relative requires.

define('base/one', function(r, e, module) { module.exports = 'pajamas'; });

define('base/two', function(require) {
  var one = require('./one');
  assert.equal(one, 'pajamas');
});


define('base/sub/one', function(r, e, module) { module.exports = 'night gown'; });

define('base/sub/two', function(require) {
  var one = require('./one');
  assert.equal(one, 'night gown');
});
define('base/sub/three', function(require) {
  var one = require('./one/');  // Also works with trailing slash?
  window.basicEndSlashWorks = true;
  assert.equal(one, 'night gown');
});
assert(window.basicEndSlashWorks);


// Require relative further up

define('not_root', function(r, e, module) { module.exports = 'not root'; });
define('root', function(r, e, module) { module.exports = 'root'; });
define('root/package', function(r, e, module) { module.exports = 'root package'; });
define('root/one', function(r, e, module) { module.exports = 'root one'; });
define('root/one/package', function(r, e, module) { module.exports = 'root one package'; });
define('root/one/two', function(r, e, module) { module.exports = 'root .. two'; });
define('root/one/two/three', function(r, e, module) { module.exports = 'root .. three'; });

define('root/one/two/test1', function(require) {
  var three = require('./three'),
      two = require('./'),
      alsoTwo = require('.'),
      one = require('../'),
      alsoOne = require('..'),
      onePkg = require('../package'),
      root = require('../../'),
      rootPkg = require('../../package'),
      notRoot = require('../../../not_root');

  assert.equal(three, 'root .. three');
  assert.equal(two, 'root .. two');
  assert.equal(alsoTwo, 'root .. two');
  assert.equal(one, 'root one');
  assert.equal(alsoOne, 'root one');
  assert.equal(onePkg, 'root one package');
  assert.equal(root, 'root');
  assert.equal(rootPkg, 'root package');
  assert.equal(notRoot, 'not root');
  window.test1Complete = true;
});

assert(window.test1Complete);



//////////////////////////////////////////////////

console.log('--------------------');
console.log('Passed: ' + passedAssertions);
console.log('Failed: ' + failedAssertions);

