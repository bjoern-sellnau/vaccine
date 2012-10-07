function nodeWrap(path, buffer) {
  var prefix = new RegExp('^' + sourceDir + '/'),
      module = path.slice(1).replace(prefix, '').replace(/\.js$/, ''),
      fullModule = appName + '/' + module,
      compiled;
  compiled = 'define("' + fullModule + '", function(require, exports, module) {\n';
  compiled += buffer.toString('utf8');
  compiled += '\n});';
  return compiled;
}
