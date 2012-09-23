
function define(id, defn) {

  if (!window.vaccine) {
    // The minimal code required to be vaccine compliant.
    (function() {
      var waiting = {}, modules = {};
      window.vaccine = {
        on: function(id, callback) {
          (waiting[id] = waiting[id] || []).push(callback);
        },
        get: function(id) {
          return modules[id];
        },
        set: function(id, val) {
          modules[id] = val;
          (waiting[id] || []).forEach(function(w) { w(); });
        }
      };
    }());
  }
  // Set your library with vaccine.set('mylib', mylib);


  var globalVaccine = window.vaccine,
      module = {exports: {}};

  function require(reqId) {

    var mod = globalVaccine.get(reqId);
    if (!mod) {
      require.id = reqId;
      throw require;  // Throw require, to ensure correct error gets handled
    }

    return mod;
  }

  try {
    defn(require, module.exports, module);
    globalVaccine.set(id, module.exports);
  } catch (e) {
    if (e != require) throw e;
    globalVaccine.on(require.id, function() { define(id, defn); });
  }
}

