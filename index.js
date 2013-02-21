
var fs = require('fs'),
    vaccine = require('./src/vaccine');

var templateFiles = ['vaccine.js', 'Makefile', 'build.sh', 'dev_server.js',
                     'umd.js'];
var templateText = {};

var optionLocations = {
  format: 'vaccine.format',
  name: 'name',
  main: 'entry',
  dependencies: 'dependencies',
  targets: 'vaccine.targets',
  exports: 'vaccine.exports',
  supports: 'supports',
  define: 'vacccine.define',
  require: 'vaccine.require',
  debugging: 'vaccine.debugging',
  src: 'vaccine.source_dir',
  global: 'vaccine.global',
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
  src: '',
  global: '',
};


var actions = {
  targets: function(targets) {
    var options = loadOptions();
    console.log(options);
    process.exit(0);
    targets.forEach(function(target) {
      var name = target.name;
      if (name === 'Makefile') {
        if (fs.existsSync('Makefile')) name = 'Makefile.example';
      }
      fs.writeFile(name, target.compiled, 'utf8', function(err) {
        if (err) throw err;
        if (name === 'build.sh') {
          fs.chmod('build.sh', '755', function(err) { if (err) throw err; });
        }
        console.log('Completed... ' + name);
      });
    });
  },
};
module.exports = exports = actions;

var loadTemplates = function() {
  var fs = require('fs');
  templateFiles.forEach(function(file) {
    templateText[file] = fs.readFileSync(__dirname + '/../templates/' + file, 'utf8');
  });
};

var loadOptions = function() {
  var jsonFile = 'vaccine.json';
  if (!fs.existsSync(jsonFile)) jsonFile = 'component.json';
  if (!fs.existsSync(jsonFile))
    fail("Must specify options in component.json (vaccine.json for apps)");
  var component = JSON.parse(fs.readFileSync(jsonFile));
  return determineOptions(component);
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
