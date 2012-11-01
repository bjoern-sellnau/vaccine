'use strict';

var templateFiles = ['vaccine.js', 'Makefile', 'build.sh', 'dev_server.js',
                     'umd.js'],
    templateText = {},
    conditionals = {};

var templateMap = {
  'vaccine.js': 'vaccine.js',
  'Makefile': 'Makefile',
  'build.sh': 'build.sh',
  'dev_server.js': 'dev_server.js',
  'vaccine_dev.js': 'vaccine.js',
  'umd.js': 'umd.js',
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
    amd,
    commonjs,
    umd,
    performance,
    debug,
    dev,
    devPerformance,
    devDebug,
    useStrict,
    dependencies = [],
    depString,
    umdDepsAmd,
    umdDepsCommonjs,
    umdDepsWindow,
    umdDepsFactory,
    numDeps,
    supportsArray,
    exportsArray,
    requireArray,
    targets,
    sourceDir,
    main;

var has = function(array, item) {
  return array.indexOf(item) >= 0;
};

var maybeHas = function(array, item) {
  if (!array) return false;
  return has(array, item);
};

var onlyHas = function(array, item) {
  return array.length === 1 && array[0] === item;
};

var maybeOnlyHas = function(array, item) {
  if (!array) return false;
  return onlyHas(array, item);
};

var exprts = function(exprtsType) {
  return has(exportsArray, exprtsType);
};

var supports = function(supportsType) {
  return has(supportsArray, supportsType);
};

var remove = function(array, item) {
  array.splice(array.indexOf(item), 1);
};

var req = function(requireType) {
  return has(requireArray, requireType);
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

var defaultForFormat = function(format) {
  var defaults = {
    amd: {
      supports: ['amd', 'window'],
      exports: ['return'],
      targets: ['vaccine.js', 'build.sh'],
      require: ['absolute', 'single'],
    },
    commonjs: {
      supports: ['amd', 'window', 'commonjs'],
      exports: ['module', 'exports'],
      targets: ['vaccine.js', 'build.sh'],
      require: ['single'],
    },
    umd: {
      supports: ['amd', 'window', 'commonjs'],
      exports: ['exports'],
      targets: ['umd.js'],
      require: [],
    }
  };
  return defaults[format];
};
exports.defaultForFormat = defaultForFormat;

exports.validateOptions = function(opts) {
  var problems = [],
      format = opts.format;

  var setDefault = function(option, value) {
    var fix = function(options) { options[option] = value; };
    var options = [{group: option, parts: value}];
    problems.push({options: options, fix: fix});
  };
  var maybeDefault = function(option, value) {
    if (!opts[option] || !opts[option].length) setDefault(option, value);
  };
  var mismatch = function(options, fix) {
    problems.push({options: options, fix: fix});
  };
  var formatMismatch = function(options, fix) {
    options.push({group: 'format', parts: [format]});
    mismatch(options, fix);
  };
  var removeWithDefault = function(options, option, item) {
    remove(options[option], item);
    if (!options[option].length) {
      options[option] = defaultForFormat(format)[option];
    }
  };


  // Defaults must come first.
  var fmtDefault = defaultForFormat(format);
  maybeDefault('supports', fmtDefault.supports);
  maybeDefault('exports', fmtDefault.exports);
  maybeDefault('targets', fmtDefault.targets);
  maybeDefault('require', fmtDefault.require);

  // Miscellaneous problems
  if (maybeHas(opts.exports, 'module') && !maybeHas(opts.exports, 'exports')) {
    mismatch([{group: 'exports', parts: ['module', 'exports']}],
             function(options) {
      options.exports.push('exports');
    });
  }
  if (maybeOnlyHas(opts.supports, 'commonjs')) {
    mismatch([{group: 'supports', parts: ['commonjs']}], function(options) {
      options.supports.push('window');
    });
  }
  if (maybeOnlyHas(opts.require, 'index')) {
    var defaultRequire = defaultForFormat(format).require;
    mismatch([{group: 'require', parts: defaultRequire}], function(options) {
      options.require = ['index'].concat(defaultRequire);
    });
  }
  if (maybeHas(opts.require, 'index') && maybeHas(opts.require, 'single')) {
    mismatch([{group: 'require', parts: ['index', 'single']}], function(options) {
      removeWithDefault(options, 'require', 'index');
    });
  }

  // AMD problems
  if (format === 'amd') {
    if (maybeHas(opts.supports, 'commonjs')) {
      formatMismatch([{group: 'supports', parts: ['commonjs']}],
            function(options) {
        remove(options.supports, 'commonjs');
      });
    }
    if (maybeOnlyHas(opts.require, 'single')) {
      formatMismatch([{group: 'require', parts: ['single']}],
          function(options) {
        options.require.push('absolute');
      });
    }
    if (maybeHas(opts.require, 'index')) {
      mismatch([{group: 'require', parts: ['index']}], function(options) {
        removeWithDefault(options, 'require', 'index');
      });
    }
  }

  // CommonJS problems
  if (format === 'commonjs') {
    if (!maybeHas(opts.supports, 'commonjs')) {
      formatMismatch([{group: 'supports', parts: ['commonjs']}],
            function(options) {
        options.supports.push('commonjs');
      });
    }
    if (maybeHas(opts.exports, 'return')) {
      formatMismatch([{group: 'exports', parts: ['return']}],
            function(options) {
        removeWithDefault(options, 'exports', 'return');
      });
    }
    if (maybeHas(opts.require, 'absolute')) {
      formatMismatch([{group: 'require', parts: ['absolute']}],
          function(options) {
        removeWithDefault(options, 'require', 'absolute');
      });
    }
  }

  // UMD problems
  if (format === 'umd') {
    if (!maybeOnlyHas(opts.targets, 'umd.js')) {
      var parts = (opts.targets || []).concat('umd.js');
      formatMismatch([{group: 'targets', parts: parts}],
          function(options) {
        options.targets = ['umd.js'];
      });
    }
    if (maybeHas(opts.supports, 'commonjs') &&
        maybeHas(opts.exports, 'return')) {
      formatMismatch([{group: 'supports', parts: ['commonjs']},
                      {group: 'exports', parts: ['return']}],
            function(options) {
        removeWithDefault(options, 'exports', 'return');
      });
    }
  } else {
    if (maybeHas(opts.targets, 'umd.js')) {
      formatMismatch([{group: 'targets', parts: ['umd.js']}],
          function(options) {
        removeWithDefault(options, 'targets', 'umd.js');
      });
    }
  }

  return problems;
}

var setOptions = function(options) {
  name = options.name;
  globalName = options.global || options.name;
  libraryDir = options.lib;
  format = options.format;
  amd = format === 'amd';
  commonjs = format === 'commonjs';
  umd = format === 'umd';
  performance = options.performance;
  debug = options.debug;
  devDebug = !options.dev_no_debug;
  devPerformance = !options.dev_no_performance;
  useStrict = options.use_strict;
  dependencies = options.dependencies || [];
  numDeps = dependencies.length;
  depString = "['" + dependencies.join("', '") + "']";
  requireArray = options.require;
  supportsArray = options.supports;
  exportsArray = options.exports;
  targets = options.targets;

  if (req('full') && req('single')) {
    remove(requireArray, 'single');
  }
  if (req('full') && req('absolute')) {
    remove(requireArray, 'absolute');
  }


  var cleanedMain = options.main.replace(/^\.\//, '').replace(/\.js$/, '');
  if (options.src) {
    sourceDir = options.src.replace(/^\.\//, '');
  } else {
    var mainSplit = cleanedMain.split('/');
    mainSplit.pop();
    sourceDir = mainSplit.join('/') || '.';
  }
  main = cleanedMain.replace(new RegExp('^' + sourceDir + '/'), '');

  if (format === 'commonjs' && req('single')) {
    main = './' + main;
  }

  if (format === 'umd') {

    umdDepsAmd = '';
    dependencies.forEach(function(dep) {
      umdDepsAmd += ", '" + dep + "'";
    });

    umdDepsCommonjs = '';
    dependencies.forEach(function(dep) {
      umdDepsCommonjs += ", require('" + dep + "')";
    });

    umdDepsWindow = '';
    dependencies.forEach(function(dep) {
      umdDepsWindow += ', root.' + dep;
    });

    umdDepsFactory = '';
    dependencies.forEach(function(dep) {
      umdDepsFactory += ', ' + dep;
    });

    if (onlyHas(exportsArray, 'return')) {
      umdDepsAmd = umdDepsAmd.slice(2);
      umdDepsCommonjs = umdDepsCommonjs.slice(2);
      umdDepsWindow = umdDepsWindow.slice(2);
      umdDepsFactory = umdDepsFactory.slice(2);
    }
  }
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
