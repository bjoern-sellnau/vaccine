    var sourceDir = '$-- sourceDir --$';   // Change this to... uh, your source directory.


    var http = require('http'),
        fs = require('fs'),
        exec = require('child_process').exec,
        port = 3000,
        rootUrl = 'http://localhost:' + port,
        server,
        types;

    types = {
      js: 'application/javascript',
      json: 'application/json',
      html: 'text/html',
      css: 'text/css',

      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      gif: 'image/gif',
      ico: 'image/x-icon',
    };

    server = http.createServer(function (req, res) {
      findFile(req.url, function(err, fileBufferOrText, path) {
        if (err) return notFound(err, req.url, res);
        var ext = path.split('.').pop();
        if (ext === path) ext = 'html';
        var type = types[ext];
        if (!type) type = 'text/plain';
        if (path.match(new RegExp('^/' + sourceDir + '/'))) {
          fileBufferOrText = nodeWrap(path, fileBufferOrText);
        }
        res.writeHead(200, {'Content-Type': type});
        res.end(fileBufferOrText);
      });
    });

    server.listen(port, 'localhost');
    console.log('Serving ' + rootUrl);
    server.on('error', console.log);

    function notFound(err, path, res) {
      console.log(err);
      if (!path.match(/favicon\.ico/)) console.log('404: ' + path);
      res.writeHead(404, {'Content-Type': 'text/plain'});
      res.end('404 Not Found\n');
    }

    function findFile(path, callback) {
      fs.stat('.' + path, function(err, stats) {
        if (err) return callback(err);

        if (stats.isDirectory()) {
          findFile(path + '/index.html', callback);
          return;
        }

        fs.readFile('.' + path, function(err, buffer) {
          callback(err, buffer, path);
        });
      });
    }

    function nodeWrap(path, buffer) {
      var prefix = new RegExp('^' + sourceDir + '/'),
          module = path.slice(1).replace(prefix, '').replace(/\.js$/, ''),
          compiled;
      compiled = 'define("' + module + '", ';
      compiled += 'function(require, $-- exprts('module') ? 'exports, module' : 'exports' --$) {\n';
      compiled += buffer.toString('utf8');
      compiled += '\n});';
      return compiled;
    }
