####################### NODE START #######################
var appName = '{{{ APP_NAME }}}',       // Change this to your app name.
    sourceDir = '{{{ SOURCE_DIR }}}';   // Change this to... uh, your source directory.


>>>>>>>>>>>>>>>>>>>>>>>> NODE END >>>>>>>>>>>>>>>>>>>>>>>>
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
####################### NODE START #######################
      if (path.match(new RegExp('^/' + sourceDir + '/'))) {
        fileBufferOrText = nodeWrap(path, fileBufferOrText);
      }
>>>>>>>>>>>>>>>>>>>>>>>> NODE END >>>>>>>>>>>>>>>>>>>>>>>>
      res.writeHead(200, {'Content-Type': type});
      res.end(fileBufferOrText);
    });
  }
});

server.listen(port, 'localhost');
console.log('Serving ' + rootUrl);
server.on('error', console.log);

--------------------- COMMON INSERT ---------------------

-------------------- NODE_WRAP INSERT --------------------
