(function() {
define('templates', function(require, exports, module) {
module.exports = ({"vaccine.js":"????????????????????????????????????????????????????????????????? (performance)\n    var vaccineFirstDefineTime,\n        vaccineRequireStart,\n        vaccineRequireEnd;\n\n///////////////////////////////////////////////////////////////////////////////\n    function define(id, factory) {\n????????????????????????????????????????????????????????????????? (performance)\n      vaccineFirstDefineTime = vaccineFirstDefineTime || Date.now();\n///////////////////////////////////////////////////////////////////////////////\n??????????????????????????????????????????????????????????????????????? (debug)\n      if ((vaccineFactories || {})[$-- dirs > 1 ? 'id' : \"'./' + id\" --$]) {\n        throw 'Attempting to redefine: ' + id;\n      } else {\n        console.log('Defining: ' + id);\n      }\n///////////////////////////////////////////////////////////////////////////////\n      (vaccineFactories = vaccineFactories || {})[$-- dirs > 1 ? 'id' : \"'./' + id\" --$] = factory;\n    }\n\n\n    function require(id) {\n????????????????????????????????????????????????????????????????? (performance)\n      if (!vaccineRequireStart) {\n        vaccineRequireStart = Date.now();\n        var firstRequire = true;\n      }\n\n///////////////////////////////////////////////////////////////////////////////\n??????????????????????????????????????????????????????????????????????? (debug)\n      console.log('Resolving require as: ' + id);\n\n///////////////////////////////////////////////////////////////////////////////\n???????????????????????????????????????????????????????????????????? (dirs > 1)\n      var parts = id.split('/');\n///////////////////////////////////////////////////////////////////////////////\n?????????????????????????????????????????????????????????????? exprts('module')\n      var module = {exports: {}};\n:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::\n  ??????????????????????????????????????????????????????? exprts('exports')\n      var exports = {};\n  /////////////////////////////////////////////////////////////////////////\n///////////////////////////////////////////////////////////////////////////////\n\n      if (!vaccineLocalModules[id] && !vaccineWindow[id]) {\n??????????????????????????????????????????????????????????????????????? (debug)\n        if (vaccineFactories[id]) {\n          console.log('Executing module factory: ' + id);\n        } else {\n          throw 'Missing module factory. Cannot execute: ' + id;\n        }\n///////////////////////////////////////////////////////////////////////////////\n        $-- exprts('return') ? 'vaccineLocalModules[id] = ' : '' --$vaccineFactories[id](\n???????????????????????????????????????????????????????????????????? (dirs > 1)\n            function(reqId) {\n  ????????????????????????????????????????????????????????????????? (debug)\n              console.log('Attempting to require: ' + reqId);\n  ///////////////////////////////////////////////////////////////// (debug)\n              var matching = /(\\.?\\.\\/?)*/.exec(reqId)[0],\n                  // Some code golf to get the number of \"directories\" back.\n                  back = Math.floor(matching.replace(/\\//g, '').length/1.9 + 0.99),\n                  base;\n              if (back) {\n                base = parts.slice(0, parts.length - back).join('/');\n                if (base) base += '/';\n                reqId = base + reqId.slice(matching.length);\n              }\n              return require(reqId.replace(/\\/$/, ''));\n            }$-- exprts('exports') ? ',' : ');' --$\n:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::\n            $-- exprts('exports') ? 'require,' : 'require);' --$\n///////////////////////////////////////////////////////////////////////////////\n?????????????????????????????????????????????????????????????? exprts('return')\n  ???????????????????????????????????????????????????????? exprts('module')\n            module.exports, module) || module.exports;\n  :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::\n    ????????????????????????????????????????????????? exprts('exports')\n            exports) || exports;\n    ///////////////////////////////////////////////////////////////////\n  /////////////////////////////////////////////////////////////////////////\n:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::\n            $-- exprts('module') ? 'module.exports, module' : 'exports' --$);\n        vaccineLocalModules[id] = $-- exprts('module') ? 'module.exports' : 'exports' --$;\n///////////////////////////////////////////////////////////////////////////////\n      }\n??????????????????????????????????????????????????????????????????????? (debug)\n      var moduleFoundWhere = vaccineLocalModules[id] ? 'local' : 'window';\n      console.log('Returning required ' + moduleFoundWhere + ' module: ' + id);\n///////////////////////////////////////////////////////////////////////////////\n????????????????????????????????????????????????????????????????? (performance)\n      if (firstRequire) {\n        vaccineRequireEnd = Date.now();\n        console.log('Defined in: ' + (vaccineRequireStart - vaccineFirstDefineTime) + ' ms');\n        console.log('Executed in: ' + (vaccineRequireEnd - vaccineRequireStart) + ' ms');\n        console.log('Overall time: ' + (vaccineRequireEnd - vaccineFirstDefineTime) + ' ms');\n      }\n///////////////////////////////////////////////////////////////////////////////\n      return vaccineLocalModules[id] || vaccineWindow[id];\n    }\n\n\n    var vaccineFactories,\n        vaccineLocalModules = {},\n?????????????????????????????????????????????? (numDeps > 1 && supports('amd'))\n        vaccineDependencies = $-- depString --$;\n///////////////////////////////////////////////////////////////////////////////\n        vaccineWindow = window;\n\n??????????????????????????????????????????????????????????????? supports('amd')\n  ?????????????????????????????????????????????????????? supports('window')\n    if (typeof vaccineWindow.define == 'function' &&\n        vaccineWindow.define.amd) {\n  /////////////////////////////////////////////////////////////////////////\n      define('$-- name --$',\n  ????????????????????????????????????????????????????????? (numDeps === 0)\n             function() {\n  ========================================================= (numDeps === 1)\n             $-- depString --$,\n             function(vaccineSingleDep) {\n               vaccineLocalModules.$-- dependencies[0] --$ = vaccineSingleDep;\n  :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::\n             vaccineDependencies,\n             function() {\n               for (var i = 0, args = arguments; i < args.length; ++i) {\n                 vaccineLocalModules[vaccineDependencies[i]] = args[i];\n               }\n  /////////////////////////////////////////////////////////////////////////\n               return require('$-- dirs > 1 ? main : \"./\" + main --$');\n             });\n    $-- supports('window') ? '} else {' : '' --$\n///////////////////////////////////////////////////////////////////////////////\n???????????????????????????????????????????????????????????? supports('window')\n      vaccineWindow.$-- globalName --$ = require('$-- dirs > 1 ? main : \"./\" + main --$');\n    $-- supports('amd') ? '}' : '' --$\n///////////////////////////////////////////////////////////////////////////////\n","Makefile":".PHONY: build\nbuild:\n\t./build.sh > $-- name --$.js\n","build.sh":"    #!/bin/sh\n    # build with: ./build.sh > $-- name --$.js\n    echo '(function() {$-- useStrict ? '\"use strict\";' : '' --$'\n\n???????????????????????????????????????????????????????????????????? (commonJS)\n    # vaccine.js must NOT be in the source list.\n    source_dir='$-- sourceDir --$'\n\n\n    for file in $(find $source_dir -type f)\n    do\n      name=$(echo \"$file\" | sed -e \"s#^$source_dir/##\" -e 's/\\.js//')\n      echo \"define('$name', function(require, $-- exprts('module') ? 'exports, module' : 'exports' --$) {\"\n      cat $file\n      echo '});'\n    done\n:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::\n    cat $(find $-- sourceDir --$ -type f)   # vaccine.js must NOT be in the source list.\n///////////////////////////////////////////////////////////////////////////////\n\n    cat vaccine.js  # Must be after sources.\n    echo '}());'\n","dev_server.js":"    var sourceDir = '$-- sourceDir --$';   // Change this to... uh, your source directory.\n\n\n    var http = require('http'),\n        fs = require('fs'),\n        exec = require('child_process').exec,\n        port = 3000,\n        rootUrl = 'http://localhost:' + port,\n        server,\n        types;\n\n    types = {\n      js: 'application/javascript',\n      json: 'application/json',\n      html: 'text/html',\n      css: 'text/css',\n\n      png: 'image/png',\n      jpg: 'image/jpeg',\n      jpeg: 'image/jpeg',\n      gif: 'image/gif',\n      ico: 'image/x-icon',\n    };\n\n    server = http.createServer(function (req, res) {\n      findFile(req.url, function(err, fileBufferOrText, path) {\n        if (err) return notFound(err, req.url, res);\n        var ext = path.split('.').pop();\n        if (ext === path) ext = 'html';\n        var type = types[ext];\n        if (!type) type = 'text/plain';\n        if (path.match(new RegExp('^/' + sourceDir + '/'))) {\n          fileBufferOrText = nodeWrap(path, fileBufferOrText);\n        }\n        res.writeHead(200, {'Content-Type': type});\n        res.end(fileBufferOrText);\n      });\n    });\n\n    server.listen(port, 'localhost');\n    console.log('Serving ' + rootUrl);\n    server.on('error', console.log);\n\n    function notFound(err, path, res) {\n      console.log(err);\n      if (!path.match(/favicon\\.ico/)) console.log('404: ' + path);\n      res.writeHead(404, {'Content-Type': 'text/plain'});\n      res.end('404 Not Found\\n');\n    }\n\n    function findFile(path, callback) {\n      fs.stat('.' + path, function(err, stats) {\n        if (err) return callback(err);\n\n        if (stats.isDirectory()) {\n          findFile(path + '/index.html', callback);\n          return;\n        }\n\n        fs.readFile('.' + path, function(err, buffer) {\n          callback(err, buffer, path);\n        });\n      });\n    }\n\n    function nodeWrap(path, buffer) {\n      var prefix = new RegExp('^' + sourceDir + '/'),\n          module = path.slice(1).replace(prefix, '').replace(/\\.js$/, ''),\n          compiled;\n      compiled = 'define(\"' + module + '\", ';\n      compiled += 'function(require, $-- exprts('module') ? 'exports, module' : 'exports' --$) {\\n';\n      compiled += buffer.toString('utf8');\n      compiled += '\\n});';\n      return compiled;\n    }\n"});});
define('vaccine', function(require, exports, module) {
'use strict';

var templateFiles = ['vaccine.js', 'Makefile', 'build.sh', 'dev_server.js'],
    templateText = {},
    conditionals = {};

var templateMap = {
  'vaccine.js': 'vaccine.js',
  'Makefile': 'Makefile',
  'build.sh': 'build.sh',
  'dev_server.js': 'dev_server.js',
  'vaccine_debug.js': 'vaccine.js',
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
    commonJS,
    performance,
    debug,
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

  var templates = [];
  targets.forEach(function(tgt) {
    var tmpl = templateMap[tgt];
    if (!has(templates, tmpl)) templates.push(tmpl);
  });

  var compiled = {};
  templates.forEach(function(template) {
    compiled[template] = compileTemplate(template);
  });

  if (has(targets, 'vaccine_debug.js')) {
    debug = true;
    performance = true;
    supportsArray = [];
    compiled['vaccine_debug.js'] = compileTemplate('vaccine.js');
  }

  return compiled;
};

var setOptions = function(options) {
  name = options.name;
  globalName = options.global || name;
  libraryDir = options.lib;
  commonJS = options.commonjs;
  performance = options.performance;
  debug = options.debug;
  useStrict = options.use_strict;
  dependencies = options.dependencies || [];
  numDeps = dependencies.length;
  depString = "['" + dependencies.join("', '") + "']";
  dirs = options.dirs;
  supportsArray = options.supports || ['amd', 'window'];
  exportsArray = options.exports || ['module', 'exports'];
  targets = options.targets || ['vaccine.js', 'vaccine_debug.js', 'Makefile', 'build.sh'];

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
});
define('web', function(require, exports, module) {
var vaccine = require('./vaccine'),
    templateText = require('./templates');

vaccine.templateText(templateText);

exports.configure = function(config) {
  config.targets = ['vaccine.js']
  var configured = vaccine(config);
  document.querySelector('#sources code').innerHTML = configured['vaccine.js'];
};
});
function define(id, factory) {
  (vaccineFactories = vaccineFactories || {})['./' + id] = factory;
}


function require(id) {
  var module = {exports: {}};

  if (!vaccineLocalModules[id] && !vaccineWindow[id]) {
    vaccineFactories[id](
        require,
        module.exports, module);
    vaccineLocalModules[id] = module.exports;
  }
  return vaccineLocalModules[id] || vaccineWindow[id];
}


var vaccineFactories,
    vaccineLocalModules = {},
    vaccineWindow = window;

  vaccineWindow.vaccine = require('./web');

}());
