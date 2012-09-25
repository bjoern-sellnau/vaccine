
define('test_app/test_index', function(require, e, module) {

  var util = require('util'),
      assert = util.assert;

  module.exports = function() {

    define('ending/in/index', function(require, exports, module) {
      module.exports = 'foobar/index';
    });

    define('ending/in/absolute', function(require) {
      var endIndex = require('ending/in/index'),
          end = require('ending/in');

      assert.equal(endIndex, end, 'mod/index and mod return same object');
      assert.equal(endIndex, 'foobar/index');
      window.endingInAbsolute = true;
    });

    assert(window.endingInAbsolute);

    define('ending/in/relative', function(require) {
      var endIndex = require('ending/in/index'),
          end = require('ending/in');

      assert.equal(endIndex, end, 'mod/index and mod return same object');
      assert.equal(endIndex, 'foobar/index');
      window.endingInRelative = true;
    });

    assert(window.endingInRelative);

  };

});

