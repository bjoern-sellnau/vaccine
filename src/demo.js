var d3 = require('d3'),
    easydemo = require('./easydemo'),
    web;

module.exports = exports = function(w) {
  web = w;
  easydemo.start('Vaccine.js - Demo', states);
};

exports.show = easydemo.show;

var updateWith = function(format, options) {
  return function(finished) {
    update(format, options);
    finished();
  };
};

var update = function(format, options) {
  format = format || 'amd';
  options = options || {};
  options.format = format;
  var i;
  var formatOptions = web.defaultForFormat(format);
  for (i in web.defaultOptions) {
    if (web.defaultOptions.hasOwnProperty(i)) {
      if (typeof options[i] === 'undefined') {
        if (typeof formatOptions[i] !== 'undefined') {
          options[i] = formatOptions[i];
        } else {
          options[i] = web.defaultOptions[i];
        }
      }
    }
  }
  web.updateWithOptions(options);
};

var enterDiffWith = function(options, savedOpts) {
  savedOpts = savedOpts || {};
  return function(finished) {
    update(savedOpts.format, savedOpts);
    web.saveCurrent();
    web.setDiff(true);
    update(options.format, options);
    finished();
  };
};

var exitDiff = function(finished) {
  web.setDiff(false);
  finished();
};


var sizeSignal = {under: '#sizes .number', top: 0, right: -7};

var states = [
  {
    enter: updateWith(),    // All default
  },
  {
    enter: updateWith('commonjs', {
      require: ['single'],
      exports: ['exports'],
      supports: ['commonjs', 'window'],
    }),
    signals: [
      sizeSignal,
    ],
  },
  {
    enter: enterDiffWith({
      format: 'commonjs',
      require: ['single'],
      exports: ['exports', 'module'],
    }, {
      format: 'commonjs',
      require: ['full'],
      exports: ['exports', 'module'],
    }),
    exit: exitDiff,
  },
  {
    enter: updateWith(),
    signals: [
      {under: '#config', top: -4, left: -4},
      {under: '#sources .source', top: 1, left: 1},
    ],
  },
  {
    enter: updateWith('amd', {
      supports: ['window', 'amd', 'commonjs'],
    }),
    exit: updateWith(),
    signals: [
      {under: '.fix', top: 0, right: -7},
    ],
  },
  {
    enter: updateWith(),
    signals: [
      {under: '#format', top: 0, left: 0},
      {under: '#supports', top: 0, left: 0}
    ],
  },
  {
    enter: enterDiffWith({
      name: 'datazooka',
      main: 'src/datazooka.js',
      dependencies: 'd3, crossfilter',
    }),
    exit: exitDiff,
    signals: [
      {under: '#variables label:first-child', top: -5, left: -5},
      {under: '#variables label:nth-child(2)', top: -5, left: -5},
      {under: '#variables label:nth-child(3)', top: -5, left: -5},
    ],
  },
  {
    enter: updateWith(),
    signals: [
      {under: '#require, #exports', top: 0, left: 0}
    ],
  },
  {
    enter: enterDiffWith({
      require: ['absolute'],
      dependencies: 'dep_one',
    }),
    exit: exitDiff,
    signals: [
      {under: '#diff', top: -5, left: -5},
      {under: '#controls', top: 8, left: 9},
      sizeSignal,
    ],
  },
  {
    enter: updateWith(),
    signals: [
      {under: '#sources .source:first-child', top: 1, left: 1},
      {under: '#sources .source:nth-child(2)', top: 1, left: 1},
    ],
  },
  {
    enter: updateWith('umd', {
      require: [],
      exports: ['exports'],
      supports: ['window', 'commonjs', 'amd'],
      targets: ['umd.js'],
    }),
    signals: [
      {under: '#umd', top: 0, left: 0},
    ],
  },
  {
    enter: updateWith('amd', {
      targets: ['vaccine_dev.js'],
    }),
    signals: [
      {under: '#sources .source', top: 1, left: 1},
    ],
  },
  {
    enter: updateWith(),
  },
  {
    enter: updateWith(),
    signals: [{under: '.open-help', top: -4, left: -4}],
  },
];

d3.selectAll('#demo-text > p').each(function(d, i) {
  states[i].text = this.innerHTML;
});
