
var outputFile = '{{{ OUTPUT_FILE }}}',   // Change this to your app file name.
    buildScript = '{{{ BUILD_SCRIPT }}}';    // Change this to your app's build script.

####################### NODE START #######################

var appName = '{{{ APP_NAME }}}',
    main = '{{{ APP_MAIN }}}',
    sourceDir = '{{{ SOURCE_DIR }}}';


var fs = require('fs');
>>>>>>>>>>>>>>>>>>>>>>>> NODE END >>>>>>>>>>>>>>>>>>>>>>>>

var express = require('express'),
    exec = require('child_process').exec,
    app = express();

app.get('/' + outputFile, function(req, res) {
  exec(buildScript, function(err, stdout) {
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

