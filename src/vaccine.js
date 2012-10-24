var templates = {},
    templateFiles = ['vaccine.js', 'Makefile', 'build.sh', 'dev_server.js'];

var name,
    globalName,
    libraryDir,
    commonJS,
    performance,
    debug,
    useStrict,
    dependencies = [],
    numDeps,
    dirLevels,
    multiDirs,
    supports,
    moduleExports,
    targets,
    sourceDir,
    mainModule;

var has = function(array, item) {
  return array.indexOf(item) >= 0;
};

module.exports = exports = function(options) {

  name = options.name;
  globalName = options.global || name;
  libraryDir = options.lib;
  commonJS = options.commonjs;
  performance = options.performance;
  debug = options.debug;
  useStrict = options.use_strict;
  dependencies = options.dependencies || [];
  numDeps = dependencies.length;
  dirLevels = options.dirs;
  multiDirs = dirLevels > 1;
  supports = options.supports || ['amd', 'window'];
  moduleExports = options.exports || ['module', 'exports'];
  targets = options.targets || ['vaccine.js', 'vaccine_debug.js', 'Makefile', 'build.sh'];

  var cleanedMain = options.main.replace(/^\.\//, '').replace(/\.js$/, '');
  if (options.src) {
    sourceDir = options.src.replace(/^\.\//, '');
  } else {
    var mainSplit = cleanedMain.split('/');
    mainSplit.pop();
    sourceDir = mainSplit.join('/') || '.';
  }
  mainModule = cleanedMain.replace(new RegExp('^' + sourceDir + '/'), '');

  console.log(sourceDir);
  console.log(mainModule);
  console.dir(templates);
};


exports.loadFromObject = function(targetsObject) {
  rawTargets = targetsObject;
};

// Only use outside of the browser.
exports.loadFiles = function() {
  var fs = require('fs');
  templateFiles.forEach(function(file) {
    templates[file] = fs.readFileSync(__dirname + '/../templates/' + file, 'utf8');
  });
};
