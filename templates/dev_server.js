    var express = require('express'),
        fs = require('fs'),
        exec = require('child_process').exec,
        port = process.env.PORT || 5000,
        app = express();

    app.get(/^\/build[\/\w]*\.?\w*$/, function(req, res) {
      exec('.' + req.path, {maxBuffer: 1024*1024}, function(err, stdout) {
        if (err) return notFound(err, req.path, res);
        res.type('application/javascript');
        res.send(stdout);
      });
    });

???????????????????????????????????????????????????????????????????? (commonjs)
    var sourceDirRe = new RegExp('^/$-- sourceDir --$/');
    app.get(sourceDirRe, function(req, res) {
      fs.readFile('.' + req.path, 'utf8', function(err, srcText) {
        if (err) return notFound(err, req.path, res);

        var module = req.path.replace(sourceDirRe, '').replace(/\.js$/, ''),
            compiled = "define('" + module + "', ";
        compiled += 'function(require, $-- exports('module') ? 'exports, module' : 'exports' --$) {\n';
  ????????????????????????????????????????????????????????????? (useStrict)
        compiled += "'use strict';\n"
  /////////////////////////////////////////////////////////////////////////
        compiled += srcText;
        compiled += '\n});';
        res.type('application/javascript');
        res.send(compiled);
      });
    });

///////////////////////////////////////////////////////////////////////////////
    var notFound = function(err, path, res) {
      console.log(err);
      res.send('404 Not Found\n', 404);
    };

    app.use(express.static(__dirname));

    app.listen(port);
    console.log('Serving localhost:' + port);
