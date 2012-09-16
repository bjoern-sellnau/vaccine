
var other = require('./other'),
    util = require('./util');

exports.execute = function() {
  return 'app: 2+1=' + util.addOne(2) + ';' + other('cool');
};

