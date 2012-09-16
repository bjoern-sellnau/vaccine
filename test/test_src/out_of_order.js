
define('test_app/out_of_order', function(require, e, module) {

  var util = require('util'),
      assert = util.assert,
      verifyCount =  util.verifyCount;

  module.exports = function() {

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

  };

});

