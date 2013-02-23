var fs = require('fs');

var vaccine = require('./src/vaccine');

var projectOptions;

var requiredOptions = ['name', 'main',     // TODO: get it down to just these
                       'format', 'require', 'exports'];

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

var determineOptions = function() {
  var options = componentOptions();
  var missing = requiredOptions.filter(function(required) {
    return !options[required];
  });
  if (missing.length)
    fail("Missing required options: " + missing.join(', '));

  var format = options.format;
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
