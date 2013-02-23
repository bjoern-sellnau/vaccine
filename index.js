
var fs = require('fs');
var child_process = require('child_process');
var exec = child_process.exec;

var express = require('express');
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
      exec(copy, maybeThrow);
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

  targets: function() {
    var targets = Array.prototype.slice.call(arguments);
    if (!targets || !targets.length)
      targets = detect().targets;
    var compiled = compileTargets(targets);
    Object.keys(compiled).forEach(function(name) {
      if (name === 'Makefile') {
        if (fs.existsSync('Makefile')) name = 'Makefile.example';
      }
      fs.writeFile(name, compiled[name], 'utf8', function(err) {
        maybeThrow(err);
        if (name === 'build.sh') {
          fs.chmod('build.sh', '755', maybeThrow);
        }
        console.log('Completed... ' + name);
      });
    });
  },

  build: function(output) {
    var options = detect();
    output = output || vaccine.derivedOptions(options).output;
    options.output = output;
    var text = buildText(options);
    if (output === '-c' || output === '--stdout') {
      console.log(text);
    } else {
      fs.writeFile(output, text, 'utf8', function(err) {
        console.log('Completed... ' + output);
      });
    }
  },

  "component.json": createComponent('component.json'),
  "vaccine.json": createComponent('vaccine.json'),

  create: function(name) {
    var args = Array.prototype.slice.call(arguments);
    var execFile = function(err) {
      maybeThrow(err);
      process.chdir(name);
      if (fs.existsSync('post_create')) {
        var spawn = child_process.spawn;
        var post = spawn('./post_create', args, {stdio: 'inherit'});
      }
    };
    ifNoExist(name, function() {
      exec('cp -R ' + libTemplateDir + ' ' + name, execFile);
    });
  },

  template: function() {
    if (libTemplateDir === userTemplateDir) {
      var when = ' before calling $vaccine template';
      console.log('Remove ~/.vaccine/template' + when);
    } else {
      var command = 'cp -R ' + libTemplateDir + ' ' + userTemplateDir;
      exec(command, maybeThrow);
    }
  },
};

var compileSingle = function(target, options) {
  return compileTargets([target], options)[target];
};
exports.compileSingle = compileSingle;

var compileTargets = function(targets, options) {
  options = options || detect();
  options = vaccine.clone(options);
  options.targets = targets;
  return compile(options);
};
exports.compileTargets = compileTargets;

var compile = function(options) {
  options = options || detect();
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


var buildText = function(options) {
  options = options || detect();
  var vac = compileSingle('vaccine.js', options);
  var d = vaccine.derivedOptions(options);
  var files = walk(d.source_dir).sort();

  // The following mirrors the logic in templates/build.sh
  var text = ';(function() {' + (d.use_strict ? '"use strict";\n' : '\n');

  files.forEach(function(filename) {
    var file = fs.readFileSync(filename, 'utf8');
    if (d.commonjs || d.define('optional_id')) {
      var src = new RegExp('^' + d.source_dir + '/');
      var name = filename.replace(src, '').replace(/\.js/, '');
      if (d.commonjs) {
        var ex = d.exports('module') ? 'exports, module' : 'exports';
        text += "define('" + name + "', function(require, " + ex + ') {';
        text += file;
        text += '});';
      } else {
        text += file.replace(/^define\(([^'"])/, "define('" + name + "', $1");
      }
    } else {
      text += file;
    }
  });

  text += vac;
  text += '}());\n';
  return text;
};
exports.buildText = buildText;

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

exports.server = function(options) {
  options = options || detect();
  var d = vaccine.derivedOptions(options);
  var app = express();
  var port = process.env.PORT || 5000;

  var buildFile = fs.existsSync('build.sh');

  app.get(/^\/build[\/\w]*\.?\w*$/, function(req, res) {
    if (!buildFile && req.path === '/build.sh') {
      res.type('application/javascript');
      res.send(buildText(options));
    } else {
      exec('.' + req.path, {maxBuffer: 1024*1024}, function(err, stdout) {
        if (err) return notFound(err, req.path, res);
        res.type('application/javascript');
        res.send(stdout);
      });
    }
  });

  if (!fs.existsSync('vaccine_dev.js')) {
    var vac = compileSingle('vaccine_dev.js', options);
    app.get(/^\/vaccine_dev\.js/, function(req, res) {
      res.type('application/javascript');
      res.send(vac);
    });
  }

  if (d.commonjs) {
    var sourceDirRe = new RegExp('^/' + d.source_dir + '/');
    app.get(sourceDirRe, function(req, res) {
      fs.readFile('.' + req.path, 'utf8', function(err, srcText) {
        if (err) return notFound(err, req.path, res);

        var module = req.path.replace(sourceDirRe, '').replace(/\.js$/, ''),
            compiled = "define('" + module + "', ";
        var ex = d.exports('module') ? 'exports, module' : 'exports';
        compiled += 'function(require, ' + ex + ') {\n';
        if (d.use_strict)
          compiled += "'use strict';\n"
        compiled += srcText;
        compiled += '\n});';
        res.type('application/javascript');
        res.send(compiled);
      });
    });
  }

  var notFound = function(err, path, res) {
    console.log(err);
    res.send('404 Not Found\n', 404);
  };

  app.use(express.static(process.cwd()));

  app.listen(port);
  console.log('Serving localhost:' + port);
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
