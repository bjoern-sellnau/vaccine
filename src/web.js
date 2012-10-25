var d3 = require('d3'),
    vaccine = require('./vaccine'),
    templateText = require('./templates');

vaccine.templateText(templateText);

var configHolder = d3.select('#config'),
    currentOptions = {};

var maybeUpdate = function() {
  var options = getOptions();
  var same = Object.keys(options).every(function(key) {
    return options[key] === currentOptions[key];
  });
  if (same) return false;
  currentOptions = options;
  update(options);
  return false;
};

var getOptions = function() {
  var options = {};
  configHolder.selectAll('input').each(function() {
    if (this.type !== 'radio' || this.checked) {
      options[this.name] = this.value;
    }
  });
  return options;
};

var update = function(rawOptions) {
  var options = {};
  Object.keys(rawOptions).forEach(function(k) { options[k] = rawOptions[k]; });
  options.dependencies = options.dependencies.split(/\W+/);
  if (options['authored-in'] === 'amd') {   // TODO, move this out to click handler.
    options.exports = ['module', 'exports', 'return'];
    options.commonjs = false;
  } else {
    options.exports = ['module', 'exports'];
    options.commonjs = true;
  }
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

  sources.select('code').text(function(d) { return d.compiled; });
};

configHolder.on('click', maybeUpdate);
configHolder.on('keyup', maybeUpdate);

maybeUpdate();
