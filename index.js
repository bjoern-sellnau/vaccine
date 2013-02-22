
var fs = require('fs');
var child_process = require('child_process');

var vaccine = require('./src/vaccine');
var detect = require('./detect');


var templateFiles = ['vaccine.js', 'Makefile', 'build.sh', 'dev_server.js',
                     'umd.js'];
var templateText = {};
var vaccineDir = process.env.HOME + '/.vaccine';
var userTemplateDir = vaccineDir + '/template';
var sourceTemplateDir = __dirname + '/lib_template';
var libTemplateDir;


var fail = function(message, num) {
  console.error(message);
  process.exit(num || 1);
};

var ifNoExist = function(path, action) {
  if (fs.existsSync(path)) {
    console.log(path + ' already exists');
  } else {
    action();
  }
};

var maybeThrow = function(err) {
  if (err) throw err;
};

var createComponent = function(filename) {
  return function() {
    ifNoExist(filename, function() {
      var copy = 'cp ' + libTemplateDir + '/component.json ' + filename;
      child_process.exec(copy, maybeThrow);
    });
  };
};


module.exports = exports = {
  defaultForFormat: vaccine.defaultForFormat,
  validateOptions: vaccine.validateOptions,

  projectOptions: detect,

  loadTemplates: function() {
    var fs = require('fs');
    templateFiles.forEach(function(file) {
      templateText[file] = fs.readFileSync(__dirname + '/templates/' + file, 'utf8');
    });
    vaccine.templateText(templateText);
  },

  templateText: function(_) {
    if (!_) return templateText;
    templateText = _;
  },

  targets: function(targets) {
    if (!targets || !targets.length)
      targets = detect().targets;
    var compiled = compileTargets(targets);
    Object.keys(compiled).forEach(function(name) {
      if (name === 'Makefile') {
        if (fs.existsSync('Makefile')) name = 'Makefile.example';
      }
      fs.writeFile(name, compiled[name], 'utf8', function(err) {
        if (err) throw err;
        if (name === 'build.sh') {
          fs.chmod('build.sh', '755', function(err) { if (err) throw err; });
        }
        console.log('Completed... ' + name);
      });
    });
  },

  "component.json": createComponent('component.json'),
  "vaccine.json": createComponent('vaccine.json'),

  create: function(args) {
    var name = args[0];
    var execFile = function(err) {
      maybeThrow(err);
      process.chdir(name);
      if (fs.existsSync('post_create')) {
        var spawn = child_process.spawn;
        var post = spawn('./post_create', args, {stdio: 'inherit'});
      }
    };
    ifNoExist(name, function() {
      child_process.exec('cp -R ' + libTemplateDir + ' ' + name, execFile);
    });
  },

  template: function() {
    if (libTemplateDir === userTemplateDir) {
      var when = ' before calling $vaccine template';
      console.log('Remove ~/.vaccine/template' + when);
    } else {
      var command = 'cp -R ' + libTemplateDir + ' ' + userTemplateDir;
      child_process.exec(command, maybeThrow);
    }
  },
};

var compileTargets = function(targets, options) {
  var options = options || detect();
  options = clone(options);
  options.targets = targets;
  return compile(options);
};
exports.compileTargets = compileTargets;

var compile = function(options) {
  var options = options || detect();
  var problems = vaccine.validateOptions(options);
  if (problems.length) {
    problems.forEach(function(problem) {
      console.log(problem.log());
    });
    process.exit(1);
  }
  return vaccine(options);
};
exports.compile = compile;

var clone = function(object) {
  var copy = {};
  var i;
  for (i in object)
    if (object.hasOwnProperty(i))
      copy[i] = object[i];
  return copy;
};

var whichLibTemplate = function() {
  if (!fs.existsSync(vaccineDir))
    fs.mkdirSync(vaccineDir);
  if (fs.existsSync(userTemplateDir))
    libTemplateDir = userTemplateDir;
  else
    libTemplateDir = sourceTemplateDir;
};

whichLibTemplate();
exports.loadTemplates();
