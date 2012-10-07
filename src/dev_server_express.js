var sourceDir = '{{{ SOURCE_DIR }}}';   // Change this to... uh, your source directory.
####################### NODE START #######################
var appName = '{{{ APP_NAME }}}';       // Change this to your app name.
>>>>>>>>>>>>>>>>>>>>>>>> NODE END >>>>>>>>>>>>>>>>>>>>>>>>


var express = require('express'),
    fs = require('fs'),
    exec = require('child_process').exec,
    app = express();

app.get(/^\/build[\/\w]*\.?\w*$/, function(req, res) {
  exec('.' + req.path, {maxBuffer: 1024*1024}, function(err, stdout) {
    if (err) return notFound(err, req.path, res);
    res.type('application/javascript');
    res.send(stdout);
  });
});

app.get(new RegExp('^/' + sourceDir + '/'), function(req, res) {
  findFile(req.path, function(err, fileBufferOrText, path) {
    if (err) return notFound(err, req.path, res);
    res.type('application/javascript');
####################### NODE START #######################
    fileBufferOrText = nodeWrap(path, fileBufferOrText);
>>>>>>>>>>>>>>>>>>>>>>>> NODE END >>>>>>>>>>>>>>>>>>>>>>>>
    res.send(fileBufferOrText);
  });
});

--------------------- COMMON INSERT ---------------------

-------------------- NODE_WRAP INSERT --------------------


app.use(express.static(__dirname));

app.listen(3000);
console.log('Serving localhost:3000');
