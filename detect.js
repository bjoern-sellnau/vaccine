var fs = require('fs');

var vaccine = require('./src/vaccine');

var projectOptions;

var requiredOptions = ['name', 'main'];

var detectableOptions = ['format', 'require', 'exports'];

var optionLocations = {
  format: 'vaccine.format',
  name: 'name',
  main: 'entry',
  dependencies: 'dependencies',
  targets: 'vaccine.targets',
  exports: 'vaccine.exports',
  supports: 'vaccine.supports',
  define: 'vaccine.define',
  require: 'vaccine.require',
  debugging: 'vaccine.debugging',
  output: 'vaccine.output',
  source_dir: 'vaccine.source_dir',
  global_name: 'vaccine.global_name',
};

var optionConversions = {
  dependencies: function(d) { return Object.keys(d); },
};

var defaultForFormat = vaccine.defaultForFormat;
var optionDefaults = {
  dependencies: {},
  debugging: [],
  source_dir: '',
  global_name: '',
  output: '',
};

var fail = function(message, num) {
  console.error(message);
  process.exit(num || 1);
};

module.exports = exports = function() {
  if (projectOptions) return projectOptions;
  projectOptions = determineOptions();
  return projectOptions;
};

var walk = function(dir) {
  var results = [];
  var list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    var stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      var res = walk(file);
      results = results.concat(res);
    } else {
      results.push(file);
    }
  });
  return results;
};
exports.walk = walk;

var determineOptions = function() {
  var options = componentOptions();
  var missing = requiredOptions.filter(function(required) {
    return !options[required];
  });
  if (missing.length)
    fail("Missing required options: " + missing.join(', '));

  var format;
  var derived = vaccine.derivedOptions(options);
  var toDetect = detectableOptions.filter(function(detectable) {
    return !options[detectable];
  });
  if (toDetect.length) {
    if (!fs.existsSync(derived.source_dir) ||
        !fs.existsSync(derived.main_file)) {
      var msg = "Cannot detect options without a file at: ";
      msg = msg + derived.main_file;
      fail(msg);
    }
    var mainText = fs.readFileSync(derived.main_file, 'utf8');
    var sourceFiles = walk(derived.source_dir).sort();
    sourceFiles = sourceFiles.map(function(file) {
      return file.slice(derived.source_dir.length + 1);
    });
    var fileInfo = sourceFiles.map(function(name) {
      return determineFileInfo(name, derived);
    });

    if (!options.format)
      options.format = detectFormat(mainText, derived);
    format = options.format;
    if (!options.require)
      options.require = detectRequire(sourceFiles, format, fileInfo, derived);
    if (!options.exports)
      options.exports = detectExports(format, fileInfo);
    console.log(options.exports);
    process.exit(1);
  }

  format = options.format;
  var defaults = defaultForFormat(format);

  // TODO: discover this instead
  options.define = options.define || defaults.define;

  options.targets = options.targets || defaults.targets;
  options.supports = options.supports || defaults.supports;
  return options;
};

var findComponentText = function() {
  var jsonFile = 'vaccine.json';
  if (!fs.existsSync(jsonFile)) jsonFile = 'component.json';
  if (!fs.existsSync(jsonFile))
    fail("Must specify options in component.json (vaccine.json for apps)");
  return JSON.parse(fs.readFileSync(jsonFile));
};

var componentOptions = function() {
  var component = findComponentText();
  var options = {};
  var vac = component.vaccine;
  Object.keys(optionLocations).forEach(function(opt) {
    var loc = optionLocations[opt];
    var prefix = 'vaccine.';
    var setting;
    if (loc.slice(0, prefix.length) === prefix) {
      if (vac) setting = vac[loc.slice(prefix.length)];
    } else {
      setting = component[loc];
    }
    if (typeof setting === 'undefined') {
      if (typeof optionDefaults[opt] !== 'undefined')
        setting = optionDefaults[opt];
    }
    if (typeof setting !== 'undefined' && optionConversions[opt])
      setting = optionConversions[opt](setting);
    options[opt] = setting;
  });
  return options;
};


var detectFormat = function(mainText, derived) {
  // This is a horrible way of detecting format, but it works
  // (mosts of the time)
  if ((/^define\(/m).test(mainText)) return 'amd';
  return 'commonjs';
};

var detectRequire = function(files, format, fileInfo, derived) {
  var numLevels = files.reduce(function(levels, file) {
    return Math.max(levels, file.split('/').length);
  }, 1);
  var hasIndex = files.some(function(file) {
    return /\/index\.js$/.test(file);
  });

  var num = function(type) {
    return function(file) {
      return file[type].length;
    };
  };

  var all = function(type) {
    return function(file) {
      return file[type].length === file.requires.length;
    };
  };

  if (format === 'commonjs') {
    if (numLevels === 1) return ['single'];
    if (!hasIndex) return ['full'];
    var withIndex = fileInfo.some(function(file) {
      return file.requires.some(function(req) {
        return /\/index$/.test(req);
      });
    });
    if (withIndex) return ['full'];
    return ['full', 'index'];
  } else {
    if (fileInfo.every(all('absolute'))) return ['absolute'];
    if (fileInfo.some(num('full'))) return ['full'];
    if (fileInfo.every(all('single'))) return ['single'];

    // must be a mix of absolute and single

    var outsideNameDir = fileInfo.filter(function(file) {
      var parts = file.name.split('/');
      if (parts[0] !== derived.name) return true;
      return parts.length !== 2;
    });
    if (outsideNameDir.every(all('absolute'))) {
      return ['absolute', 'single'];
    } else {
      return ['full'];
    }
  }
};

var detectExports = function(format, fileInfo) {
  var hasExports = fileInfo.some(function(f) {
    return f.exports;
  });
  var hasModule = fileInfo.some(function(f) {
    return f.module;
  });
  if (format === 'amd') {
    // TODO: I don't know any safe way to naively determine this, so for now
    // always include 'return'.
    var exports = ['return'];
  } else {
    var exports = [];
  }
  if (hasExports || hasModule)
    exports.push('exports');
  if (hasModule)
    exports.push('module');
  return exports;
};

var determineFileInfo = function(name, derived) {
  var text = fs.readFileSync(derived.source_dir + '/' + name, 'utf8');

  // TODO: this is parsing for require's. That will need to
  // change when AMD supports the dependency array.
  var requires = text.match(/\brequire\(['"][^'"]*['"]\)/g) || [];
  requires = requires.map(function(req) {
    return /require\(['"]([^'"]*)['"]\)/.exec(req)[1];
  });
  requires = requires.filter(function(req) {
    return derived.dependencies.indexOf(req) === -1;
  });
  return {
    name: name,
    exports: /\bexports\./.test(text),
    module: /\bmodule\.exports/.test(text),
    requires: requires,
    absolute: requires.filter(function(req) {
      return /^[^\.]/.test(req);
    }),
    single: requires.filter(function(req) {
      return /^\.\/[^\/]*$/.test(req);
    }),
    full: requires.filter(function(req) {
      if (/^\.\.\//.test(req)) return true;
      return /^\.\/.+\/.+$/.test(req);
    }),
  };
};
