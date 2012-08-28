
var passedAssertions = 0,
    failedAssertions = 0;

function assert(test) {
  if (test) {
    passedAssertions += 1;
  } else {
    failedAssertions += 1;
    console.log('Assertion failed');
    console.trace();
  }
}

kissmd('no dependencies', function() {
  window.cool = 'yep';
  return {returns: 'an object'};
});

assert(window.cool === 'yep');


kissmd('in order define', function(require) {
  var main = require('no dependencies');
  assert(main.returns === 'an object');
});

kissmd('single out of order define', (function() {
  var count = 0;

  return function(require) {
    count += 1;
    var defBelow = require('defined below');

    // This function should have actually been called twice,
    // but only gotten to here once (exception thrown the first
    // time as 'defBelow' was not defined)
    assert(count === 2);
    assert(defBelow() === 'cool');
  };
}()));

kissmd('defined below', function() {
  return function() { return 'cool'; };
});

