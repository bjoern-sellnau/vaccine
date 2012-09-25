function nodeWrap(path, rawFileText) {
  var prefix = new RegExp('^' + sourceDir + '/'),
      module = path.slice(1).replace(prefix, '').replace(/\.js$/, ''),
      fullModule = appName + '/' + module,
      compiled;
  compiled = 'define("' + fullModule + '", function(require, exports, module) {';
  compiled += rawFileText;
  compiled += '});';
  if (fullModule.match(/\/index$/)) {
    var firstPart = fullModule.replace(/\/index$/, '');
    compiled += '\n';
    compiled += 'define("' + firstPart + '", function(require, exports, module) {\n';
    compiled += '  module.exports = require("' + fullModule + '");\n';
    compiled += '});\n';
  }
  return compiled;
}
