var d3 = require('d3'),
    easydemo = require('./easydemo'),
    updateWithOptions,
    defaultOptions;

module.exports = function(update, deflt) {
  updateWithOptions = update;
  defaultOptions = deflt;
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
  for (i in defaultOptions) {
    if (defaultOptions.hasOwnProperty(i)) {
      if (typeof options[i] === 'undefined') {
        options[i] = defaultOptions[i];
      }
    }
  }
  updateWithOptions(options);
};

var states = [
  {
    enter: updateWith({}),    // All default
  },
  {},
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
