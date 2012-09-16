
define('test_app/complex', function(require, e, module) {

  var util = require('util'),
      assert = util.assert,
      verifyCount =  util.verifyCount;

  module.exports = function() {

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

  };

});

