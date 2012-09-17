
var outputFile = 'my_app.js',   // Change this to your app file name.
    buildScript = './build';    // Change this to your app's build script.


var appName = 'my_app',
    main = 'index',
    sourceDir = 'src';


var fs = require('fs');

var express = require('express'),
    exec = require('child_process').exec,
    app = express();

app.get('/' + outputFile, function(req, res) {
  exec(buildScript, function(err, stdout) {
    res.type('application/javascript');
    res.send(stdout);
  });
});

app.get(new RegExp('^/' + sourceDir + '/.*'), function(req, res) {
  fs.readFile('.' + req.path, 'utf8', function(err, rawFileData) {
    if (err) throw err;
    var prefix = new RegExp('^' + sourceDir + '/'),
        module = req.path.slice(1).replace(prefix, '').replace(/\.js$/, ''),
        fullModule = appName + '/' + module,
        compiled;
    compiled = 'define("' + fullModule + '", function(require, exports, module) {';
    compiled += rawFileData;
    compiled += '});';
    if (module === main) {
      compiled += 'define("' + appName + '", function(require, exports, module) {';
      compiled += '  module.exports = require("' + fullModule + '");';
      compiled += '});';
    }
    res.type('application/javascript');
    res.send(compiled);
  });
});

app.use(express.static(__dirname));

app.listen(3000);

