var fs = require('fs');

var vaccine = require('./src/vaccine');

var projectOptions;

var optionLocations = {
  format: 'vaccine.format',
  name: 'name',
  main: 'entry',
  dependencies: 'dependencies',
  targets: 'vaccine.targets',
  exports: 'vaccine.exports',
  supports: 'supports',
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
  targets: defaultForFormat,
  define: defaultForFormat,
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
  var jsonFile = 'vaccine.json';
  if (!fs.existsSync(jsonFile)) jsonFile = 'component.json';
  if (!fs.existsSync(jsonFile))
    fail("Must specify options in component.json (vaccine.json for apps)");
  var component = JSON.parse(fs.readFileSync(jsonFile));
  projectOptions = determineOptions(component);
  return projectOptions;
};

var determineOptions = function(component) {
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
      if (typeof optionDefaults[opt] === 'undefined')
        fail("Missing required option: " + loc);
      setting = optionDefaults[opt];
      if (typeof setting === 'function')
        setting = setting(options.format)[opt];
    }
    if (optionConversions[opt])
      setting = optionConversions[opt](setting);
    options[opt] = setting;
  });
  return options;
};
