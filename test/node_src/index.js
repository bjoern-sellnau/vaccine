
var other = require('./other'),
    util = require('./util');

exports.execute = function() {
  return 'app: 2+1=' + util.addOne(2) + ';' + other('cool');
};

// Do this so we can use vaccine in node_test/test.js, without needing
// to explicitly add vaccine.js.
window.node_define = define;

