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

var onlyHas = function(array, item) {
  return array.length === 1 && array[0] === item;
};

var remove = function(array, item) {
  var index = array.indexOf(item);
  if (index >= 0) array.splice(index, 1);
};

var capitalize = function(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

var clone = function(object) {
  var copy = {};
  var i;
  for (i in object)
    if (object.hasOwnProperty(i))
      copy[i] = object[i];
  return copy;
};


module.exports = exports = function(options) {
  var d = currentDerivedOptions = derivedOptions(options);

  var allCompiled = {};
  d.targets.forEach(function(target) {
    if (target === 'vaccine_dev.js') {
      d.dev = true;
      var oldSupportsArray = d.supportsArray;
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
exports.clone = clone;

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
      supports: ['amd', 'window'],
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
  var d = derivedOptions(opts);
  var problems = [];
  var format = opts.format;

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
  var formatMismatches = function(options, fix) {
    options.push({group: 'format', parts: [format]});
    mismatch(options, fix);
  };
  var formatMismatch = function(group, part, fix) {
    formatMismatches([{group: group, parts: [part]}], fix);
  };
  var removeWithDefault = function(options, option, item) {
    remove(options[option], item);
    if (!options[option].length) {
      options[option] = defaultForFormat(format)[option];
    }
  };
  var removeIfHas = function(group, part) {
    if (d[group](part)) {
      formatMismatch(group, part, function(options) {
        removeWithDefault(options, group, part);
      });
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
  var unknownTargets = d.targets.filter(function(t) {
    return !templateMap[t];
  });
  if (unknownTargets.length) {
    problems.push({log: function() {
      return 'Unknown target(s): ' + unknownTargets.join(', ');
    }});
  }

  // Miscellaneous mismatches
  if (d.exports('module') && !d.exports('exports')) {
    mismatch([{group: 'exports', parts: ['module', 'exports']}],
             function(options) {
      options.exports.push('exports');
    });
  }
  if (d.require('index') && d.require('single')) {
    mismatch([{group: 'require', parts: ['index', 'single']}], function(options) {
      removeWithDefault(options, 'require', 'index');
    });
  }
  if (d.onlyRequire('index')) {
    mismatch([{group: 'require', parts: ['index']}], function(options) {
      options.require.push('full');
    });
  }

  // AMD mismatches
  if (format === 'amd') {
    removeIfHas('require', 'index');
  } else {
    removeIfHas('define', 'optional_id');
  }

  // CommonJS mismatches
  if (format === 'commonjs') {
    removeIfHas('exports', 'return');
    removeIfHas('require', 'absolute');
  }

  // UMD mismatches
  if (format === 'umd') {
    if (!onlyHas(d.targets, 'umd.js')) {
      var parts = (opts.targets || []).concat('umd.js');
      formatMismatches([{group: 'targets', parts: parts}], function(options) {
        options.targets = ['umd.js'];
      });
    }
    if (d.supports('commonjs') && d.exports('return')) {
      formatMismatches([{group: 'supports', parts: ['commonjs']},
                        {group: 'exports', parts: ['return']}],
            function(options) {
        removeWithDefault(options, 'exports', 'return');
      });
    }
  } else {
    if (has(d.targets, 'umd.js')) {
      formatMismatch('targets', 'umd.js', function(options) {
        options.targets = ['umd.js'];
      });
    }

    if (opts.require && !opts.require.length) {
      var defaultRequire = defaultForFormat(format).require;
      mismatch([{group: 'require', parts: defaultRequire}], function(options) {
        options.require = defaultRequire;
      });
    }
  }

  return problems;
};

var derivedOptions = function(options) {

  var arrayify = function(opt) {
    if (Array.isArray(opt)) return opt.slice();
    return [];
  };

  var stringify = function(opt) {
    if (Object.prototype.toString.call(opt) === '[object String]')
      return opt;
    return '';
  };

  var debugging = arrayify(options.debugging);
  var name = stringify(options.name);
  var format = stringify(options.format);
  var d = {
    name: name,
    global_name: stringify(options.global_name) || name,
    main_file: stringify(options.main),
    format: format,
    amd: format === 'amd',
    commonjs: format === 'commonjs',
    umd: format === 'umd',
    debug: has(debugging, 'debug'),
    performance: has(debugging, 'performance'),
    use_strict: has(debugging, 'use_strict'),
    dependencies: arrayify(options.dependencies),
    requireArray: arrayify(options.require),
    supportsArray: arrayify(options.supports),
    exportsArray: arrayify(options.exports),
    defineArray: arrayify(options.define),
    targets: arrayify(options.targets),
    output: stringify(options.output) || name + '.js',
    dev: false,
  };
  d.numDeps = d.dependencies.length;
  d.depString = "['" + d.dependencies.join("', '") + "']";

  derivedHelpers(d);

  if (d.require('full') && d.require('single')) {
    remove(d.requireArray, 'single');
  }
  if (d.require('full') && d.require('absolute')) {
    remove(d.requireArray, 'absolute');
  }


  var cleanedMain = d.main_file.replace(/^\.\//, '');
  cleanedMain = cleanedMain.replace(/\.js$/, '');
  var source_dir = stringify(options.source_dir);
  if (source_dir) {
    d.source_dir = source_dir.replace(/^\.\//, '').replace(/\/$/, '');
  } else {
    var mainSplit = cleanedMain.split('/');
    mainSplit.pop();
    d.source_dir = mainSplit.join('/') || '.';
  }
  d.main = cleanedMain.replace(new RegExp('^' + d.source_dir + '/'), '');

  if (onlyHas(d.requireArray, 'single')) {
    d.main = './' + d.main;
  }

  if (isValidIdentifier(d.global_name)) {
    d.setGlobalName = '.' + d.global_name;
  } else {
    d.setGlobalName = "['" + d.global_name + "']";
  }
  if (d.numDeps === 1) {
    var firstDep = d.dependencies[0];
    if (isValidIdentifier(firstDep)) {
      d.setDependency = '.' + firstDep;
    } else {
      d.setDependency = "['" + firstDep + "']";
    }
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

var derivedHelpers = function(derived) {
  ['exports', 'supports', 'require', 'define'].forEach(function(group) {
    var groupArray = group + 'Array';
    var cap = capitalize(group);
    derived[group] = function(type) {
      return has(derived[groupArray], type);
    };
    derived['only' + cap] = function(type) {
      return onlyHas(derived[groupArray], type);
    };
    derived['num' + cap] = derived[groupArray].length;
  });
};

var isValidIdentifier = function(id) {
  var obj = {};
  try {
    eval('obj.' + id + ' = true');
  } catch (err) {
  }
  return obj[id] || false;
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
