// Keep these top two lines, so that the built line numbers line
// with these.
var d3 = require('d3'),
    hijs = require('./hijs'),
    jsdiff = require('./jsdiff'),
    uglifyjs = require('./uglify-js'),
    vaccine = require('./vaccine'),
    templateText = require('./templates');

var prepend = function(text, pre) {
  var split = text.split('\n');
  split.pop();
  return pre + split.join('\n' + pre);
};

var diff = function(old, next) {
  // Reverse the next and old so that removed lines show before added.
  var chunks = jsdiff.diffLines(next, old).map(function(d) {
    if (d.removed) {
      return '<span class="added">' + prepend(d.value, '+') + '</span>';
    } else if (d.added) {
      return '<span class="removed">' + prepend(d.value, '-') + '</span>';
    } else {
      return prepend(d.value, ' ');
    }
  });
  return chunks.join('\n');
};

vaccine.templateText(templateText);

var configHolder = d3.select('#config'),
    currentOptions = {},
    currentCompiled,
    currentSize,
    savedOptions,
    savedCompiled,
    savedCompiledMap,
    savedSize,
    diffEnabled = false;

var defaultOptions = {
  format: 'amd',
  name: 'my_lib_name',
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
  update();
  return false;
};

var getOptions = function() {
  var options = {};
  configHolder.selectAll('.inputs input').each(function() {
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
  configHolder.selectAll('.inputs input').each(function() {
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

var update = function() {
  configHolder.select('#save').attr('disabled', null);
  currentCompiled = compile();
  var vaccineCompiled = currentCompiled.filter(function(d) {
    return d.name === 'vaccine.js';
  });
  if (vaccineCompiled.length) {
    vaccineCompiled = '(function() {' + vaccineCompiled[0].compiled + '})()';
    try {
      // substract the "(function(){...})()" (16 bytes)
      currentSize = uglifyjs(vaccineCompiled).length - 16;
    } catch (e) {
      currentSize = 1;
    }
  } else {
    currentSize = null;
  }
  updateSources();
};

var compile = function() {
  var options = {},
      current = currentOptions;
  Object.keys(current).forEach(function(k) {
    if (Array.isArray(current[k])) {
      options[k] = current[k].slice();
    } else {
      options[k] = current[k];
    }
  });
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

  var problems = vaccine.validateOptions(options);
  d3.selectAll('.problem').classed('problem', false);
  problems.forEach(function(problem) {
    problem.options.forEach(function(opt) {
      var group = d3.select('#' + opt.group);
      if (!group) return;
      group.select('.title').classed('problem', true);
      var labels = group.selectAll('label');
      labels.each(function() {
        var label = d3.select(this),
            input = label.select('input');
        if (opt.parts.indexOf(input.attr('value')) >= 0) {
          label.classed('problem', true);
        }
      });
    });
    problem.fix();
  });

  return vaccine(options);
};

var updateSources = function() {
  currentCompiled.forEach(function(d) {
    if (diffEnabled) {
      d.html = diff(savedCompiledMap[d.name], d.compiled);
    } else {
      d.html = hijs(d.compiled);
    }
  });
  var sources = d3.select('#sources').selectAll('.source')
      .data(currentCompiled, function(d) { return d.name; });

  sources.enter().append('div')
      .attr('class', 'source')
      .each(function(d) {
        source = d3.select(this);
        if (d.name === 'vaccine.js') {
          var titleContainer = source.append('div')
              .attr('class', 'title-and-size');
          titleContainer.append('div')
              .attr('id', 'sizes');
        } else {
          var titleContainer = source;
        }
        titleContainer.append('div')
            .attr('class', 'title')
            .text(d.name);
        source.append('div')
            .attr('class', 'code-container')
            .append('code');
      });

  sources.exit().remove();

  var order = ['vaccine.js', 'build.sh', 'Makefile',
               'vaccine_dev.js', 'dev_server.js'];
  sources.sort(function(a, b) {
    return order.indexOf(a.name) - order.indexOf(b.name);
  });

  sources.select('code').html(function(d) { return d.html; });

  if (currentSize) {
    if (currentSize === 1 || diffEnabled && savedSize === 1) {
      var min = 'Oops!';
      var gzip = min;
    } else {
      if (diffEnabled) {
        var min = currentSize - savedSize;
        var gzip = gzipFromMin(currentSize) - gzipFromMin(savedSize);
      } else {
        var min = currentSize;
        var gzip = gzipFromMin(currentSize);
      }
      gzip = 5 * Math.round(gzip / 5);
    }
    var sizeHtml = numberSpan(min) + ' bytes minified';
    sizeHtml += numberSpan(gzip, true) + ' bytes gzipped';
    sizeHtml += '<span class="asterisk">*</span>';
    sources.select('#sizes').html(sizeHtml);
  }
};

var gzipFromMin = function(min) {
  // Calculated from 14 vaccine variations applied to converted
  // underscore (see jakesandlund/underscore branch gzip-sizes).
  return 7.976827711761272 + 0.4496433129841989 * min;
};

var numberSpan = function(number, approximate) {
  if (!diffEnabled || number === 0 || number.length) {
    var numClass = 'number';
  } else if (number > 0) {
    var numClass = 'number added';
  } else {
    var numClass = 'number removed';
  }
  if (number.length) {
    var abs = number;
  } else {
    var abs = Math.abs(number);
    if (approximate) abs = '~' + abs;
  }
  return '<span class="' + numClass + '">' + abs + '</span>';
};

var toggleDiff = function() {
  diffEnabled = !diffEnabled;
  configHolder.select('#diff').classed('active', diffEnabled);
  updateSources();
};

var makeCompiledMap = function(compiled) {
  var map = {};
  compiled.forEach(function(d) { map[d.name] = d.compiled; });
  return map;
};

var saveCurrent = function() {
  savedCompiled = currentCompiled;
  savedCompiledMap = makeCompiledMap(currentCompiled);
  savedOptions = currentOptions;
  savedSize = currentSize;
  configHolder.select('#save').attr('disabled', 'disabled');
  if (diffEnabled) updateSources();
};

var swapSaved = function() {
  if (!savedOptions) return;
  var options = currentOptions,
      compiled = currentCompiled,
      size = currentSize;
  currentOptions = savedOptions;
  currentCompiled = savedCompiled;
  currentSize = savedSize;
  savedOptions = options;
  savedCompiled = compiled;
  savedCompiledMap = makeCompiledMap(compiled);
  savedSize = size;
  setOptions(currentOptions);
  updateSources();
};

var changeFormat = function() {
  var format = this.value;
  if (currentOptions.format === format) return;
  var options = getOptions();
  if (format === 'amd') {
    options.exports = ['exports', 'module', 'return'];
    options.supports = ['window', 'amd'];
  } else {
    options.exports = ['exports', 'module'];
    options.supports = ['window', 'amd', 'commonjs'];
  }
  setOptions(options);
};

configHolder.selectAll('#format input').each(function() {
  d3.select(this).on('click', changeFormat);
});
configHolder.on('click', maybeUpdate);
configHolder.on('keyup', maybeUpdate);
configHolder.select('#diff').on('click', toggleDiff);
configHolder.select('#save').on('click', saveCurrent);
configHolder.select('#swap').on('click', swapSaved);

setOptions(defaultOptions);
maybeUpdate();
saveCurrent();
