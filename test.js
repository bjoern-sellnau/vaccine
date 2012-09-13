
"use strict";

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

  return function(require) {
    topCount += 1;
    var ret = func(require);
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

define('no dependencies', function() {
  window.cool = 'yep';
  return {returns: 'an object'};
});

assert.equal(window.cool, 'yep');


define('in order define', function(require) {
  var main = require('no dependencies');
  assert.equal(main.returns, 'an object');
  return true;
});

// This function should have actually been called twice,
// but only gotten to the end once (exception thrown the first
// time as 'defBelow' was not defined)
define('single out of order define', verifyCount(2, function(require) {
  var defBelow = require('defined below');

  assert.equal(defBelow(), 'cool');
  return true;
}));

define('defined below', function() {
  return function() { return 'cool'; };
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
  return true;
}));

// Twice, failing only once for ooo4
define('out of order 2', verifyCount(2, function(require) {
  var ooo4 = require('ooo4');

  assert.equal(ooo4.phrase, 'of a kind');
  return {phrase: 'pair'};
}));

define('ooo3', verifyCount(2, function(require) {
  var ooo2 = require('out of order 2');
  assert.equal(ooo2.phrase, 'pair');
  return {phrase: 'is the magic number'};
}));

define('ooo4', function(require) {
  return {phrase: 'of a kind'};
});

// Make sure ooo5 triggers ooo1 to define
assert(!window.ooo1);
define('ooo5', function(require) {
  return {phrase: 'is a dive'};
});
assert.equal(window.ooo1, true);


//////////////////////////////////////////////////
// Test catching exceptions

try {
  define('exceptional 1', function(require) {
    require('exceptional 2');
    return true;
  });
} catch (e) {
  assert(false, 'Should never throw not defined exceptions');
}
define('exceptional 2', function() { return true; });

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

define('base/one', function() { return 'pajamas'; });

define('base/two', function(require) {
  var one = require('./one');
  assert.equal(one, 'pajamas');
});


define('base/sub/one', function() { return 'night gown'; });

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

define('not_root', function() { return 'not root'; });
define('root', function() { return 'root'; });
define('root/package', function() { return 'root package'; });
define('root/one', function() { return 'root one'; });
define('root/one/package', function() { return 'root one package'; });
define('root/one/two', function() { return 'root .. two'; });
define('root/one/two/three', function() { return 'root .. three'; });

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

