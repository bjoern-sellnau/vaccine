function nodeWrap(path, rawFileText) {
  var prefix = new RegExp('^' + sourceDir + '/'),
      module = path.slice(1).replace(prefix, '').replace(/\.js$/, ''),
      fullModule = appName + '/' + module,
      compiled;
  compiled = 'define("' + fullModule + '", function(require, exports, module) {';
  compiled += rawFileText;
  compiled += '});';
  if (module === main) {
    compiled += 'define("' + appName + '", function(require, exports, module) {';
    compiled += '  module.exports = require("' + fullModule + '");';
    compiled += '});';
  }
  return compiled;
}
