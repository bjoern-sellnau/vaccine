
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

assert.equal(kissmd.get('undef'), undefined);

kissmd.set('set test', 'set test passed?');
assert.equal(kissmd.get('set test'), 'set test passed?');

kissmd.on('pancake', function() { window.syrup = true; });

kissmd.set('waffle', 'hmm');
assert(!window.syrup);
kissmd.set('pancake');
assert(window.syrup);


//////////////////////////////////////////////////
// Simple dependencies

kissmd('no dependencies', function() {
  window.cool = 'yep';
  return {returns: 'an object'};
});

assert.equal(window.cool, 'yep');


kissmd('in order define', function(require) {
  var main = require('no dependencies');
  assert.equal(main.returns, 'an object');
  return true;
});

// This function should have actually been called twice,
// but only gotten to the end once (exception thrown the first
// time as 'defBelow' was not defined)
kissmd('single out of order define', verifyCount(2, function(require) {
  var defBelow = require('defined below');

  assert.equal(defBelow(), 'cool');
  return true;
}));

kissmd('defined below', function() {
  return function() { return 'cool'; };
});


//////////////////////////////////////////////////
// More complex out of order test

// Called three or four times.
// Current implementation gets called 4 times
kissmd('out of order 1', verifyCount(3, 4, function(require) {
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
kissmd('out of order 2', verifyCount(2, function(require) {
  var ooo4 = require('ooo4');

  assert.equal(ooo4.phrase, 'of a kind');
  return {phrase: 'pair'};
}));

kissmd('ooo3', verifyCount(2, function(require) {
  var ooo2 = require('out of order 2');
  assert.equal(ooo2.phrase, 'pair');
  return {phrase: 'is the magic number'};
}));

kissmd('ooo4', function(require) {
  return {phrase: 'of a kind'};
});

// Make sure ooo5 triggers ooo1 to define
assert(!window.ooo1);
kissmd('ooo5', function(require) {
  return {phrase: 'is a dive'};
});
assert.equal(window.ooo1, true);


//////////////////////////////////////////////////
// Test catching exceptions

try {
  kissmd('exceptional 1', function(require) {
    require('exceptional 2');
    return true;
  });
} catch (e) {
  assert(false, 'Should never throw not defined exceptions');
}
kissmd('exceptional 2', function() { return true; });

try {
  kissmd('exceptional 3', function(require) {
    throw 'My bad...';
  });
  assert(false, 'Should rethrow other exceptions');
} catch (e) {
  assert.equal(e, 'My bad...', 'Should not modify rethrown exceptions');
}


//////////////////////////////////////////////////
// Testing prefixes

kissmd('base/one', function() { return 'pajamas'; });

kissmd('base/two', function(require) {
  var one = require('./one');
  assert.equal(one, 'pajamas');
});


kissmd('base/sub/one', function() { return 'night gown'; });

kissmd('base/sub/two', function(require) {
  var one = require('./one');
  assert.equal(one, 'night gown');
});


var base = kissmd.prefix('base');
base('three', function() { return window.base3 = 'base 3 rocks'; });
assert.equal(window.base3, 'base 3 rocks');
assert.equal(kissmd.get('base/three'), 'base 3 rocks');

base('four', function(require) {
  assert(require('./one'), 'pajamas');
});


console.log('--------------------');
console.log('Passed: ' + passedAssertions);
console.log('Failed: ' + failedAssertions);

