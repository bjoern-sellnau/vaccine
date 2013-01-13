var fs = require('fs'),
    exec = require('child_process').exec,
    express = require('express'),
    env = process.env.NODE_ENV,
    app = express();

if (env === 'development') {
  app.get('/vaccine.js', function(req, res) {
    exec('./build.sh', {maxBuffer: 400000}, function(err, built) {
      if (err) throw err;
      res.type('js');
      res.send(built);
    });
  });

  app.get('/src/templates.js', function(req, res) {
    exec('./build_templates.js', {maxBuffer: 400000}, function(err, built) {
      if (err) throw err;
      res.type('js');
      var compiled = "define('templates', function(require, exports, module) {\n";
      compiled += built;
      compiled += '\n});';
      res.send(compiled);
    });
  });

  var sourceDirRe = new RegExp('^/src/');
  app.get(sourceDirRe, function(req, res) {
    fs.readFile('.' + req.path, 'utf8', function(err, srcText) {
      if (err) throw err;

      var module = req.path.replace(sourceDirRe, '').replace(/\.js$/, ''),
          compiled = "define('" + module + "', ";
      compiled += 'function(require, exports, module) {\n';
      compiled += srcText;
      compiled += '\n});';
      res.type('application/javascript');
      res.send(compiled);
    });
  });
}

app.use(express.static('public'));

var port = process.env.PORT || 5000;
app.listen(port);
console.log('listening on port ' + port);
