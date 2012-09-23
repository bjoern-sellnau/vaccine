
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

  var parts = id.split('/');

  var globalVaccine = window.vaccine,
      module = {exports: {}};

  function require(reqId) {

    var matching = /(\.?\.\/?)*/.exec(reqId)[0],
        // Some code golf to get the number of "directories" back we want to go
        back = Math.floor(matching.replace(/\//g, '').length / 1.9 + 0.99),
        base;
    if (back) {
      base = parts.slice(0, parts.length - back).join('/');
      if (base) base += '/';
      reqId = base + reqId.slice(matching.length);
    }
    reqId = reqId.replace(/\/$/, '');
    var mod = globalVaccine.get(reqId);

    return mod;
  }

    defn(require, module.exports, module);
    globalVaccine.set(id, module.exports);
}

