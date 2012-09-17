
var outputFile = '{{{ OUTPUT_FILE }}}',   // Change this to your app file name.
    buildScript = '{{{ BUILD_SCRIPT }}}';    // Change this to your app's build script.

<<<<<<<<<<<<<<<<<<<<<<< NODE START <<<<<<<<<<<<<<<<<<<<<<<

var sourceDir = '{{{ SOURCE_DIR }}}',
    main = '{{{ APP_MAIN }}}';


var fs = require('fs'),
    appName = outputFile.split('.').shift();
------------------------ NODE END ------------------------

var express = require('express'),
    exec = require('child_process').exec,
    app = express();

app.get('/' + outputFile, function(req, res) {
  exec(buildScript, function(err, stdout) {
    res.type('application/javascript');
    res.send(stdout);
  });
});

<<<<<<<<<<<<<<<<<<<<<<< NODE START <<<<<<<<<<<<<<<<<<<<<<<
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
------------------------ NODE END ------------------------

app.use(express.static(__dirname));

app.listen(3000);

