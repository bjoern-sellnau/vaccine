var templateFiles = ['vaccine.js', 'Makefile', 'build.sh', 'dev_server.js'],
    templateText = {},
    conditionals = {};

var templateMap = {
  'vaccine.js': 'vaccine.js',
  'Makefile': 'Makefile',
  'build.sh': 'build.sh',
  'dev_server.js': 'dev_server.js',
  'vaccine_debug.js': 'vaccine.js',
};

var macroMap = {
  '?????': 'if',
  '=====': 'elsif',
  '/////': 'end',
  ':::::': 'else',
};

var name,
    globalName,
    libraryDir,
    commonJS,
    performance,
    debug,
    useStrict,
    dependencies = [],
    numDeps,
    dirs,
    supportsArray,
    exportsArray,
    targets,
    sourceDir,
    mainModule;

var has = function(array, item) {
  return array.indexOf(item) >= 0;
};

var exprts = function(exprtsType) {
  return has(exportsArray, exprtsType);
};

var supports = function(supportsType) {
  return has(supportsArray, supportsType);
};

module.exports = exports = function(options) {

  setOptions(options);

  var templates = [];
  targets.forEach(function(tgt) {
    var tmpl = templateMap[tgt];
    if (!has(templates, tmpl)) templates.push(tmpl);
  });

  var compiled = {};
  templates.forEach(function(template) {
    compiled[template] = compileTemplate(template);
  });

  if (has(targets, 'vaccine_debug.js')) {
    debug = true;
    performance = true;
    supportsArray = [];
    compiled['vaccine_debug.js'] = compileTemplate('vaccine.js');
  }

  return compiled;
};

var setOptions = function(options) {
  name = options.name;
  globalName = options.global || name;
  libraryDir = options.lib;
  commonJS = options.commonjs;
  performance = options.performance;
  debug = options.debug;
  useStrict = options.use_strict;
  dependencies = options.dependencies || [];
  numDeps = dependencies.length;
  dirs = options.dirs;
  supportsArray = options.supports || ['amd', 'window'];
  exportsArray = options.exports || ['module', 'exports'];
  targets = options.targets || ['vaccine.js', 'vaccine_debug.js', 'Makefile', 'build.sh'];

  var cleanedMain = options.main.replace(/^\.\//, '').replace(/\.js$/, '');
  if (options.src) {
    sourceDir = options.src.replace(/^\.\//, '');
  } else {
    var mainSplit = cleanedMain.split('/');
    mainSplit.pop();
    sourceDir = mainSplit.join('/') || '.';
  }
  mainModule = cleanedMain.replace(new RegExp('^' + sourceDir + '/'), '');
};


var compileTemplate = function(templateName) {
  var template = templateText[templateName],
      stack = [];
      top = {enabled: true};
      enabled = true;
      stackEnabled = true;
      first = true;
      compiled = '';

  template.split('\n').forEach(function(line) {
    var match = line.match(/([?\/=:]{5})( .*)?$/);
    if (match) {
      var type = macroMap[match[1]];
      if (type === 'end' || type === 'if') {
        if (type === 'end') top = stack.pop();
        if (type === 'if') {
          stack.push(top);
          top = {};
        }
        stackEnabled = stack.every(function(d) { return d.enabled; });
      }
      if (stackEnabled && type !== 'end') {
        if (top.wasTrue) {
          top.enabled = false;
        } else {
          if (type === 'else') {
            top.enabled = true;
          } else {
            top.enabled = evaluate(match[2]);
          }
        }
        top.wasTrue = top.wasTrue || top.enabled;
      }
      enabled = stackEnabled && top.enabled;
    } else {
      if (enabled) compiled += line.replace(/^    /, '') + '\n';
    }
  });
  return compiled;
};

var evaluate = function(string) {
  return eval(string);
};


exports.loadFromObject = function(targetsObject) {
  rawTargets = targetsObject;
};

// Only use outside of the browser.
exports.loadFiles = function() {
  var fs = require('fs');
  templateFiles.forEach(function(file) {
    templateText[file] = fs.readFileSync(__dirname + '/../templates/' + file, 'utf8');
  });
};
