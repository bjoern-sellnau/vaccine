vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv NODE
var appName = '{{{ APP_NAME }}}',       // Change this to your app name.
    sourceDir = '{{{ SOURCE_DIR }}}';   // Change this to... uh, your source directory.


^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ NODE
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
  if (req.url.match(/^\/build[\/\w]*\.?\w*$/)) {
    exec('.' + req.url, {maxBuffer: 1024*1024}, function(err, stdout) {
      if (err) return notFound(err, req.url, res);
      res.writeHead(200, {'Content-Type': 'application/javascript'});
      res.end(stdout);
    });
  } else {
    findFile(req.url, function(err, fileBufferOrText, path) {
      if (err) return notFound(err, req.url, res);
      var ext = path.split('.').pop();
      if (ext === path) ext = 'html';
      var type = types[ext];
      if (!type) type = 'text/plain';
vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv NODE
      if (path.match(new RegExp('^/' + sourceDir + '/'))) {
        fileBufferOrText = nodeWrap(path, fileBufferOrText);
      }
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ NODE
      res.writeHead(200, {'Content-Type': type});
      res.end(fileBufferOrText);
    });
  }
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

vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv STANDALONE

    if (stats.isDirectory()) {
      findFile(path + '/index.html', callback);
      return;
    }
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ STANDALONE

    fs.readFile('.' + path, function(err, buffer) {
      callback(err, buffer, path);
    });
  });
}

vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv NODE
--------------------------------------------------------------------- NODE_WRAP
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ NODE
