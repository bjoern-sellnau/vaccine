
var express = require('express'),
    exec = require('child_process').exec,
    app = express(),
    outputFile = 'test_built.js';   // change this to your app file name

app.get('/' + outputFile, function(req, res) {
  exec('./build', function(err, stdout) {
    res.type('application/javascript');
    res.send(stdout);
  });
});

app.use(express.static(__dirname));

app.listen(3000);

