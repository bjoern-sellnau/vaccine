var templateText = {},
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

var currentDerivedOptions;

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

var remove = function(array, item) {
  var index = array.indexOf(item);
  if (index >= 0) array.splice(index, 1);
};


var derivedHelpers = function(derived) {
  var d = derived;
  d.exprts = function(exprtsType) {
    return has(d.exportsArray, exprtsType);
  };

  d.supports = function(supportsType) {
    return has(d.supportsArray, supportsType);
  };

  d.req = function(requireType) {
    return has(d.requireArray, requireType);
  };

  d.onlyReq = function(requireType) {
    return onlyHas(d.requireArray, requireType);
  };

  d.define = function(defineType) {
    return has(d.defineArray, defineType);
  };
};


module.exports = exports = function(options) {
  var d = currentDerivedOptions = derivedOptions(options);

  var allCompiled = {};
  d.targets.forEach(function(target) {
    if (target === 'vaccine_dev.js') {
      d.dev = true;
      var oldSupportsArray = supportsArray;
      d.supportsArray = [];
    }
    var compiled = compileTemplate(templateMap[target]);
    if (target === 'vaccine_dev.js') {
      d.dev = false;
      d.supportsArray = oldSupportsArray;
    }
    allCompiled[target] = compiled;
  });
  return allCompiled;
};

var defaultForFormat = function(format) {
  var defaults = {
    amd: {
      supports: ['amd', 'window'],
      exports: ['exports', 'module', 'return'],
      targets: ['vaccine.js', 'build.sh'],
      require: ['full', 'single', 'absolute'],
      define: ['optional_id'],
    },
    commonjs: {
      supports: ['amd', 'window', 'commonjs'],
      exports: ['module', 'exports'],
      targets: ['vaccine.js', 'build.sh'],
      require: ['full', 'index'],
      define: [],
    },
    umd: {
      supports: ['amd', 'window', 'commonjs'],
      exports: ['exports', 'module'],
      targets: ['umd.js'],
      require: [],
      define: [],
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
    var log = function() {
      return 'Setting ' + option + ' to default of ' + value;
    };
    var options = [{group: option, parts: value}];
    problems.push({options: options, fix: fix, log: log});
  };
  var maybeDefault = function(option, value) {
    if (!opts[option] || !opts[option].length) setDefault(option, value);
  };
  var mismatch = function(options, fix) {
    var log = function() {
      var msg = 'Mismatch between options';
      options.forEach(function(opt) {
        msg += '\n    ' + opt.group + ': ' + opt.parts.join(', ');
      });
      return msg;
    };
    problems.push({options: options, fix: fix, log: log});
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
  if (!opts.require) setDefault('require', fmtDefault.require);
  if (!opts.define) setDefault('define', fmtDefault.define);

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
  if (maybeHas(opts.require, 'index') && maybeHas(opts.require, 'single')) {
    mismatch([{group: 'require', parts: ['index', 'single']}], function(options) {
      removeWithDefault(options, 'require', 'index');
    });
  }
  if (maybeOnlyHas(opts.require, 'index')) {
    mismatch([{group: 'require', parts: ['index']}], function(options) {
      options.require.push('full');
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
    if (maybeHas(opts.require, 'index')) {
      mismatch([{group: 'require', parts: ['index']}], function(options) {
        removeWithDefault(options, 'require', 'index');
      });
    }
  } else {
    if (maybeHas(opts.define, 'optional_id')) {
      formatMismatch([{group: 'define', parts: ['optional_id']}],
          function(options) {
        removeWithDefault(options, 'define', 'optional_id');
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
    if (!opts.require || !opts.require.length) {
      var defaultRequire = defaultForFormat(format).require;
      mismatch([{group: 'require', parts: defaultRequire}], function(options) {
        options.require = defaultRequire;
      });
    }
  }

  return problems;
};

var derivedOptions = function(options) {
  var d = derived = {
    name: options.name,
    globalName: options.global || options.name,
    libraryDir: options.lib,
    format: options.format,
    amd: format === 'amd',
    commonjs: format === 'commonjs',
    umd: format === 'umd',
    performance: options.performance,
    debug: options.debug,
    useStrict: options.use_strict,
    dependencies: options.dependencies || [],
    requireArray: options.require,
    supportsArray: options.supports,
    exportsArray: options.exports,
    defineArray: options.define,
    targets: options.targets,
    dev: false,
  };
  d.numDeps = d.dependencies.length;
  d.depString = "['" + d.dependencies.join("', '") + "']";

  derivedHelpers(d);

  if (d.req('full') && d.req('single')) {
    remove(d.requireArray, 'single');
  }
  if (d.req('full') && d.req('absolute')) {
    remove(d.requireArray, 'absolute');
  }


  var cleanedMain = options.main.replace(/^\.\//, '').replace(/\.js$/, '');
  if (options.src) {
    d.sourceDir = options.src.replace(/^\.\//, '');
  } else {
    var mainSplit = cleanedMain.split('/');
    mainSplit.pop();
    d.sourceDir = mainSplit.join('/') || '.';
  }
  d.main = cleanedMain.replace(new RegExp('^' + d.sourceDir + '/'), '');

  if (onlyHas(d.requireArray, 'single')) {
    d.main = './' + d.main;
  }

  if (d.format === 'umd') {

    d.umdDepsAmd = '';
    d.dependencies.forEach(function(dep) {
      d.umdDepsAmd += ", '" + dep + "'";
    });

    d.umdDepsCommonjs = '';
    d.dependencies.forEach(function(dep) {
      d.umdDepsCommonjs += ", require('" + dep + "')";
    });

    d.umdDepsWindow = '';
    d.dependencies.forEach(function(dep) {
      d.umdDepsWindow += ', root.' + dep;
    });

    d.umdDepsFactory = '';
    d.dependencies.forEach(function(dep) {
      d.umdDepsFactory += ', ' + dep;
    });

    if (onlyHas(d.exportsArray, 'return')) {
      d.umdDepsAmd = d.umdDepsAmd.slice(2);
      d.umdDepsCommonjs = d.umdDepsCommonjs.slice(2);
      d.umdDepsWindow = d.umdDepsWindow.slice(2);
      d.umdDepsFactory = d.umdDepsFactory.slice(2);
    }
  }

  return d;
};
exports.derivedOptions = derivedOptions;


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
          return evaluate(group);
        });
        compiled += compiledLine.replace(/^    /, '') + '\n';
      }
    }
  });
  return compiled.slice(0, -1);   // Remove last newline.
};

var evaluate = function(string) {
  with (currentDerivedOptions)
    return eval(string);
};


exports.templateText = function(_) {
  if (!_) return templateText;
  templateText = _;
};
