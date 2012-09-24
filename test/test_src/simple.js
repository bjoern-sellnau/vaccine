
define('test_app/simple', function(require, e, module) {

  var outOfOrder = require('./out_of_order'),
      util = require('util'),
      assert = util.assert,
      verifyCount =  util.verifyCount;

  module.exports = function() {

    //////////////////////////////////////////////////
    // Testing on, get, and set

    // Call a single define, as this is needed to set the
    // global vaccine

    define('make the global vaccine', function() {});

    assert.equal(vaccine.g('undef'), undefined);

    vaccine.s('set test', 'set test passed?');
    assert.equal(vaccine.g('set test'), 'set test passed?');

    vaccine.o('pancake', function() { window.syrup = true; });

    vaccine.s('waffle', 'hmm');
    assert(!window.syrup);
    vaccine.s('pancake');
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


    outOfOrder();


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

  };

});

