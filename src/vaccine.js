'use strict';

var templateFiles = ['vaccine.js', 'Makefile', 'build.sh', 'dev_server.js'],
    templateText = {},
    conditionals = {};

var templateMap = {
  'vaccine.js': 'vaccine.js',
  'Makefile': 'Makefile',
  'build.sh': 'build.sh',
  'dev_server.js': 'dev_server.js',
  'vaccine_dev.js': 'vaccine.js',
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
    format,
    performance,
    debug,
    dev,
    devPerformance,
    devDebug,
    useStrict,
    dependencies = [],
    depString,
    numDeps,
    dirs,
    supportsArray,
    exportsArray,
    targets,
    sourceDir,
    main;

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

  return targets.map(function(target) {
    if (target === 'vaccine_dev.js') {
      var old = {
        debug: debug,
        performance: performance,
        supportsArray: supportsArray
      };
      dev = true;
      debug = devDebug;
      performance = devPerformance;
      supportsArray = [];
    }
    var compiled = compileTemplate(templateMap[target]);
    if (target === 'vaccine_dev.js') {
      dev = false;
      debug = old.debug;
      performance = old.performance;
      supportsArray = old.supportsArray;
    }
    return {name: target, compiled: compiled};
  });
};

exports.validateOptions = function(opts) {
  var problems = [];
  var setDefault = function(option, value) {
    var fix = function() { opts[option] = value; };
    problems.push({type: 'default', option: option, value: value, fix: fix});
  };
  var maybeDefault = function(option, value) {
    if (!opts[option]) setDefault(option, value);
  };
  var mismatch = function(id, fix) {
    problems.push({type: 'mismatch', id: id, fix: fix});
  };

  var format = opts.format;
  maybeDefault('global', opts.name);
  maybeDefault('dependencies', []);
  switch (format) {
    case 'amd':
      maybeDefault('supports', ['amd', 'window']);
      if (!opts.exports || !opts.exports.length) {
        setDefault('exports', ['module', 'exports', 'return']);
      }
      maybeDefault('targets', ['vaccine.js', 'build.sh']);
      break;
    case 'commonjs':
      maybeDefault('supports', ['amd', 'window', 'commonjs']);
      if (!opts.exports || !opts.exports.length) {
        setDefault('exports', ['module', 'exports']);
      }
      maybeDefault('targets', ['vaccine.js', 'build.sh']);
      break;
  }

  if (opts.exports && has(opts.exports, 'module') &&
                      !has(opts.exports, 'exports')) {
    mismatch('module-no-exports', function() {
      opts.exports.push('exports');
    });
  }
  return problems;
}

var setOptions = function(options) {
  name = options.name;
  globalName = options.global;
  libraryDir = options.lib;
  format = options.format;
  performance = options.performance;
  debug = options.debug;
  devDebug = !options.dev_no_debug;
  devPerformance = !options.dev_no_performance;
  useStrict = options.use_strict;
  dependencies = options.dependencies;
  numDeps = dependencies.length;
  depString = "['" + dependencies.join("', '") + "']";
  dirs = options.dirs;
  supportsArray = options.supports;
  exportsArray = options.exports;
  targets = options.targets;

  var cleanedMain = options.main.replace(/^\.\//, '').replace(/\.js$/, '');
  if (options.src) {
    sourceDir = options.src.replace(/^\.\//, '');
  } else {
    var mainSplit = cleanedMain.split('/');
    mainSplit.pop();
    sourceDir = mainSplit.join('/') || '.';
  }
  main = cleanedMain.replace(new RegExp('^' + sourceDir + '/'), '');
};


var compileTemplate = function(templateName) {
  var template = templateText[templateName],
      stack = [],
      top = {enabled: true},
      enabled = true,
      stackEnabled = true,
      first = true,
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
      if (enabled) {
        var compiledLine = line.replace(/\$--(.*?)--\$/g, function(match, group) {
          return eval(group);
        });
        compiled += compiledLine.replace(/^    /, '') + '\n';
      }
    }
  });
  return compiled.slice(0, -1);   // Remove last newline.
};

var evaluate = function(string) {
  return eval(string);
};


exports.templateText = function(_) {
  if (!_) return templateText;
  templateText = _;
};

// Only use outside of the browser.
exports.loadFiles = function() {
  var fs = require('fs');
  templateFiles.forEach(function(file) {
    templateText[file] = fs.readFileSync(__dirname + '/../templates/' + file, 'utf8');
  });
};
