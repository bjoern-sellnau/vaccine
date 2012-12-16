function define(id, factory) {
  (vaccineFactories = vaccineFactories || {}
  )['./' + id] = factory;
}


function require(id) {
  var module = {exports: {}};

  if (!vaccineModules[id] && !vaccineWindow[id]) {
    vaccineFactories[id](
        require,
        module.exports, module);
    vaccineModules[id] = module.exports;
  }
  return vaccineModules[id] || vaccineWindow[id];
}


var vaccineFactories,
    vaccineModules = {},
    vaccineWindow = window;

  vaccineWindow.vaccine = require('./web');
