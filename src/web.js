var d3 = require('d3'),
    hijs = require('./hijs'),
    vaccine = require('./vaccine'),
    templateText = require('./templates');

vaccine.templateText(templateText);

var configHolder = d3.select('#config'),
    currentOptions = {};

var defaultOptions = {
  format: 'amd',
  name: 'my_library_name',
  main: 'src/index.js',
  dependencies: ['dep_one', 'dep_two'],
  dirs: '1',
  targets: ['vaccine.js', 'build.sh'],
  exports: ['exports', 'module', 'return'],
  supports: ['amd', 'window'],
  debugging: [],
  src: '',
  global: '',
};

var maybeUpdate = function() {
  var options = getOptions();
  var same = Object.keys(options).every(function(key) {
    var next = options[key];
    if (!Array.isArray(next)) {
      return next === currentOptions[key];
    }
    var current = currentOptions[key];
    if (current.length !== next.length) return false;
    return !next.filter(function(d) { return current.indexOf(d) < 0; }).length;
  });
  if (same) return false;
  currentOptions = options;
  update(options);
  return false;
};

var getOptions = function() {
  var options = {};
  configHolder.selectAll('input').each(function() {
    if (this.type === 'checkbox') {
      options[this.name] = options[this.name] || [];
      if (this.checked) options[this.name].push(this.value);
    } else if (this.type !== 'radio' || this.checked) {
      options[this.name] = this.value;
    }
  });
  return options;
};

var setOptions = function(options) {
  configHolder.selectAll('input').each(function() {
    var current = options[this.name];
    if (this.type === 'checkbox') {
      this.checked = current.indexOf(this.value) >= 0;
    } else if (this.type === 'radio') {
      this.checked = current === this.value;
    } else {
      this.value = current;
    }
  });
};

var update = function(rawOptions) {
  var options = {};
  Object.keys(rawOptions).forEach(function(k) { options[k] = rawOptions[k]; });
  var deps = [];
  options.dependencies.split(/\W+/).forEach(function(dep) {
    if (dep) deps.push(dep);
  });
  options.dependencies = deps;

  var debugging = options.debugging;
  options.debug = debugging.indexOf('debug') >= 0;
  options.performance = debugging.indexOf('performance') >= 0;
  options.use_strict = debugging.indexOf('use-strict') >= 0;
  options.commonjs = options.format === 'commonjs';

  var configured = vaccine(options);

  var sources = d3.select('#sources').selectAll('.source')
      .data(configured, function(d) { return d.name; });

  sources.enter().append('div')
      .attr('class', 'source')
      .each(function(d) {
        source = d3.select(this);
        source.append('div')
            .attr('class', 'title')
            .text(d.name);
        source.append('code');
      });

  sources.exit().remove();

  var order = ['build.sh', 'Makefile', 'vaccine.js',
               'vaccine_dev.js', 'dev_server.js'];
  sources.sort(function(a, b) {
    return order.indexOf(a.name) - order.indexOf(b.name);
  });

  sources.select('code').html(function(d) { return hijs(d.compiled); });
};

var changeFormat = function() {
  var amd = (this.value === 'amd' && this.checked) || !this.checked;
  var options = getOptions();
  if (amd) {
    options.exports = ['exports', 'module', 'return'];
  } else {
    options.exports = ['exports', 'module'];
  }
  setOptions(options);
};

configHolder.selectAll('#format input').each(function() {
  d3.select(this).on('click', changeFormat);
});
configHolder.on('click', maybeUpdate);
configHolder.on('keyup', maybeUpdate);

setOptions(defaultOptions);
maybeUpdate();
