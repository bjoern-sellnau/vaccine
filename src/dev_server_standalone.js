####################### NODE START #######################

var appName = '{{{ APP_NAME }}}',       // Change this to your app name.
    sourceDir = '{{{ SOURCE_DIR }}}';   // Change this to... uh, your source directory.

>>>>>>>>>>>>>>>>>>>>>>>> NODE END >>>>>>>>>>>>>>>>>>>>>>>>

var http = require('http'),
    fs = require('fs'),
    exec = require('child_process').exec,
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
};

http.createServer(function (req, res) {
  if (req.url.match(/\/build[\/\w]*$/)) {
    exec('.' + req.url, function(err, stdout) {
      if (err) return notFound(req.url, res);
      res.writeHead(200, {'Content-Type': 'application/javascript'});
      res.end(stdout);
    });
  } else {
    findFile(req.url, res, false);
  }
}).listen(3000, 'localhost');

function findFile(path, res, lastCheck) {
  fs.stat('.' + path, function(err, stats) {
    if (err) {
      if (lastCheck) return notFound(path, res);
      var re = /\/(\w*)\.js$/,
          match = re.exec(path);
      if (!match) return notFound(path, res);
      var dir = match[1],
          replace = '/' + (dir ? dir + '/' : '') + 'index.js';
      findFile(path.replace(re, replace), res, true);
      return;
    }
    if (stats.isDirectory()) {
      findFile(path + '/index.html', res, true);
      return;
    }

    fs.readFile('.' + path, 'utf8', function(err, fileText) {
      if (err) throw err;
      var type = types[path.split('.').pop()];
      if (!type) type = 'text/plain';
####################### NODE START #######################
      if (path.match(new RegExp('^.' + sourceDir + '/'))) {
        fileText = nodeWrap(path, fileText);
      }
>>>>>>>>>>>>>>>>>>>>>>>> NODE END >>>>>>>>>>>>>>>>>>>>>>>>
      res.writeHead(200, {'Content-Type': type});
      res.end(fileText);
    });
  });
}

-------------------- NODE_WRAP INSERT --------------------

function notFound(path, res) {
  console.log('404: ' + path);
  res.writeHead(404, {'Content-Type': 'text/plain'});
  res.end('404 Not Found\n');
}

