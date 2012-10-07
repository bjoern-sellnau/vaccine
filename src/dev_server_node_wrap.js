function nodeWrap(path, buffer) {
  var prefix = new RegExp('^' + sourceDir + '/'),
      module = path.slice(1).replace(prefix, '').replace(/\.js$/, ''),
      fullModule = appName + '/' + module,
      compiled;
#################### RENAME_MAIN START ####################
  if (module === 'index') fullModule = appName;
>>>>>>>>>>>>>>>>>>>>> RENAME_MAIN END >>>>>>>>>>>>>>>>>>>>>
  compiled = 'define("' + fullModule + '", function(require, exports, module) {\n';
  compiled += buffer.toString('utf8');
  compiled += '\n});';
  return compiled;
}
