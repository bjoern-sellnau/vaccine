
function define(id, defn) {

  var globalVaccine =
  window.vaccine || (window.vaccine = {
    // The minimal code required to be vaccine compliant.

    // w = waiting: Functions to be called when a modules
    // gets defined. w[moduleId] = [array of functions];
    w: {},

    // m = modules: Modules that have been fully defined.
    // m[moduleId] = module.exports value
    m: {},

    // s = set: When a module becomes fully defined, set
    // the module.exports value here.
    // s(moduleId, module.exports)
    s: function(id, val) {
      this.m[id] = val;
      (this.w[id] || []).forEach(function(w) { w(); });
    }
  });
  // Set your library with vaccine.s('mylib', mylib);


  var module = {exports: {}};

  function require(reqId) {

    var mod = globalVaccine.m[reqId];
    if (!mod) {
      require.id = reqId;
      throw require;  // Throw require, to ensure correct error gets handled
    }

    return mod;
  }

  try {
    defn(require, module.exports, module);
    globalVaccine.s(id, module.exports);
  } catch (e) {
    if (e != require) throw e;
    (globalVaccine.w[require.id] || (globalVaccine.w[require.id] = []))
        .push(function() { define(id, defn); });
  }
}

