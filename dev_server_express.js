
var outputFile = 'my_app.js',   // Change this to your app file name.
    buildScript = './build';    // Change this to your app's build script



var express = require('express'),
    exec = require('child_process').exec,
    app = express();

app.get('/' + outputFile, function(req, res) {
  exec(buildScript, function(err, stdout) {
    res.type('application/javascript');
    res.send(stdout);
  });
});

app.use(express.static(__dirname));

app.listen(3000);

