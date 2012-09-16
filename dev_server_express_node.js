
var outputFile = 'my_app.js',   // Change this to your app file name.
    buildScript = './build';    // Change this to your app's build script.

// DEV_SERVER_EXPRESS_NODE_START

var sourceDir = 'src';


var fs = require('fs'),
    appName = outputFile.split('.').shift();
// DEV_SERVER_EXPRESS_NODE_END

var express = require('express'),
    exec = require('child_process').exec,
    app = express();

app.get('/' + outputFile, function(req, res) {
  exec(buildScript, function(err, stdout) {
    res.type('application/javascript');
    res.send(stdout);
  });
});

// DEV_SERVER_EXPRESS_NODE_START
app.get(new RegExp('^/' + sourceDir + '/.*'), function(req, res) {
  fs.readFile('.' + req.path, 'utf8', function(err, rawFileData) {
    if (err) throw err;
    var prefix = new RegExp('^' + sourceDir + '/'),
        pathPart = req.path.slice(1).replace(prefix, ''),
        module = appName + '/' + pathPart.replace(/\.js$/, ''),
        compiled;
    compiled = 'define("' + module + '", function(require, exports, module) {';
    compiled += rawFileData;
    compiled += '});';
    res.type('application/javascript');
    res.send(compiled);
  });
});
// DEV_SERVER_EXPRESS_NODE_END

app.use(express.static(__dirname));

app.listen(3000);

