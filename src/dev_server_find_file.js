function findFile(path, callback, lastCheck) {
  fs.stat('.' + path, function(err, stats) {
    if (err) {
      if (lastCheck) return callback(true);
      var re = /\/(\w*)\.js$/,
          match = re.exec(path);
      if (!match) return callback(true);
      var dir = match[1],
          replace = '/' + (dir ? dir + '/' : '') + 'index.js';
      findFile(path.replace(re, replace), callback, true);
      return;
    }
#################### STANDALONE START ####################

    if (stats.isDirectory()) {
      findFile(path + '/index.html', callback, true);
      return;
    }
>>>>>>>>>>>>>>>>>>>>> STANDALONE END >>>>>>>>>>>>>>>>>>>>>

    fs.readFile('.' + path, 'utf8', function(err, fileText) {
      callback(err, fileText, path);
    });
  });
}
