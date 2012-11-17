var d3 = require('d3'),
    easydemo = require('./easydemo'),
    web;

module.exports = function(w) {
  web = w;
  easydemo.start();
};

var updateWith = function(options) {
  return function(finished) {
    update(options);
    finished();
  };
};

var update = function(options) {
  var i;
  for (i in web.defaultOptions) {
    if (web.defaultOptions.hasOwnProperty(i)) {
      if (typeof options[i] === 'undefined') {
        options[i] = web.defaultOptions[i];
      }
    }
  }
  web.updateWithOptions(options);
};

var enterDiff = function(finished) {
  update({});
  web.saveCurrent();
  web.setDiff(true);
  update({
    require: ['absolute'],
    dependencies: 'dep_one',
  });
  finished();
};

var exitDiff = function(finished) {
  web.setDiff(false);
  finished();
};


var sizeSignal = {under: '#sizes .number', top: 0, right: -7};

var states = [
  {
    enter: updateWith({}),    // All default
  },
  {
    enter: updateWith({
      format: 'commonjs',
      require: ['single'],
      exports: ['exports'],
      supports: ['commonjs', 'window'],
    }),
    signals: [
      sizeSignal,
    ],
  },
  {
    enter: updateWith({
      format: 'amd',
      require: ['full'],
      exports: ['exports', 'module', 'return'],
      supports: ['amd', 'window'],
    }),
    signals: [
      sizeSignal,
      {under: '#require', top: 0, left: -7},
      {under: '#exports', top: 0, left: -7},
    ],
  },
  {
    enter: updateWith({}),
    signals: [
      {under: '#config', top: -4, left: -4},
      {under: '#sources .source', top: 1, left: 1},
    ],
  },
  {
    enter: updateWith({
      format: 'commonjs',
      require: ['absolute', 'single'],
      exports: ['exports', 'module'],
      supports: ['window', 'amd', 'commonjs'],
    }),
    exit: updateWith({}),
    signals: [
      {under: '.fix', top: 0, right: -7},
    ],
  },
  {
    enter: enterDiff,
    exit: exitDiff,
    signals: [
      {under: '#diff', top: -5, left: -5},
      {under: '#controls', top: 28, left: 18},
      sizeSignal,
    ],
  },
  {},
  {},
  {},
  {},
];

d3.selectAll('#demo-text > p').each(function(d, i) {
  states[i].text = this.innerHTML;
});

easydemo.title('Vaccine.js');
easydemo.states(states);
