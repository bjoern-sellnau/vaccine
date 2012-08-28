(function(kissmdName) {

  var waiting = {},
      modules = {};

  function makeDefine() {

    function define(id, defn) {
      try {
        kissmd.set(id, defn(require));
      } catch (e) {
        if (e !== require) throw e;
        kissmd.on(require.id, function() { define(id, defn); });
      }
    }
    define.on = function(id, callback) {
      (waiting[id] = waiting[id] || []).push(callback);
    };
    define.get = function(id) {
      return modules[id];
    };
    define.set = function(id, val) {
      modules[id] = val;
      (waiting[id] || []).forEach(function(w) { w(); });
    };

    function require(id) {
      var mod = define.get(id);
      if (!mod) {
        require.id = id;
        throw require;  // Throw require, to ensure correct error gets handled
      }
      return mod;
    }
    define.require = require;

    return define;
  }

  var localKissmd = makeDefine();
  if (!window.kissmd) window.kissmd = localKissmd;

}());

