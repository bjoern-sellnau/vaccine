
var sourceDir = '{{{ SOURCE_DIR }}}';   // Change this to... uh, your source directory.
####################### NODE START #######################
var appName = '{{{ APP_NAME }}}';       // Change this to your app name.
>>>>>>>>>>>>>>>>>>>>>>>> NODE END >>>>>>>>>>>>>>>>>>>>>>>>


var express = require('express'),
    fs = require('fs'),
    exec = require('child_process').exec,
    app = express();

app.get(/^\/build[\/\w]*\.?\w*$/, function(req, res) {
  exec('.' + req.path, function(err, stdout) {
    if (err) return notFound(req.path, res);
    res.type('application/javascript');
    res.send(stdout);
  });
});

app.get(new RegExp('^/' + sourceDir + '/.*'), function(req, res) {
  findFile(req.path, function(err, fileText, path) {
    if (err) return notFound(req.path, res);
    res.type('application/javascript');
####################### NODE START #######################
    fileText = nodeWrap(path, fileText);
>>>>>>>>>>>>>>>>>>>>>>>> NODE END >>>>>>>>>>>>>>>>>>>>>>>>
    res.send(fileText);
  });
});

function notFound(path, res) {
  console.log('404: ' + path);
  res.send('Not Found', 404);
}

-------------------- FIND_FILE INSERT --------------------

-------------------- NODE_WRAP INSERT --------------------


app.use(express.static(__dirname));

app.listen(3000);

