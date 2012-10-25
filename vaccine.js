function define(id, factory) {
  (vaccineFactories = vaccineFactories || {})['./' + id] = factory;
}


function require(id) {
  var module = {exports: {}};

  if (!vaccineLocalModules[id] && !vaccineWindow[id]) {
    vaccineFactories[id](
        require,
        module.exports, module);
    vaccineLocalModules[id] = module.exports;
  }
  return vaccineLocalModules[id] || vaccineWindow[id];
}


var vaccineFactories,
    vaccineLocalModules = {},
    vaccineWindow = window;

  vaccineWindow.vaccine = require('./web');

