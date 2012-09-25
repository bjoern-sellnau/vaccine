####################### NODE START #######################

var appName = '{{{ APP_NAME }}}',       // Change this to your app name.
    sourceDir = '{{{ SOURCE_DIR }}}';   // Change this to... uh, your source directory.


var fs = require('fs');
>>>>>>>>>>>>>>>>>>>>>>>> NODE END >>>>>>>>>>>>>>>>>>>>>>>>

var express = require('express'),
    exec = require('child_process').exec,
    app = express();

app.get(/\/build[\/\w]*$/, function(req, res) {
  exec('.' + req.path, function(err, stdout) {
    res.type('application/javascript');
    res.send(stdout);
  });
});

####################### NODE START #######################
app.get(new RegExp('^/' + sourceDir + '/.*'), function(req, res) {
  fs.readFile('.' + req.path, 'utf8', function(err, rawFileText) {
    if (err) throw err;
    res.type('application/javascript');
    res.send(nodeWrap(req.path, rawFileText));
  });
});

-------------------- NODE_WRAP INSERT --------------------

>>>>>>>>>>>>>>>>>>>>>>>> NODE END >>>>>>>>>>>>>>>>>>>>>>>>

app.use(express.static(__dirname));

app.listen(3000);

