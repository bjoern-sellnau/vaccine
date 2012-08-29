(function() {

  var waiting = {},
      modules = {};

  function makeDefine(prefix) {

    function define(originalId, defn) {
      var id = prefix + originalId,
          parts = id.split('/'),
          base = parts.slice(0, parts.length - 1).join('/');
      if (base) base += '/';

      function require(reqId) {
        if (reqId.slice(0, 2) == './') reqId = base + reqId.slice(2, reqId.length);
        var mod = define.get(reqId);
        if (!mod) {
          require.id = reqId;
          throw require;  // Throw require, to ensure correct error gets handled
        }
        return mod;
      }

      try {
        kissmd.set(id, defn(require));
      } catch (e) {
        if (e != require) throw e;
        kissmd.on(require.id, function() { define(originalId, defn); });
      }
    }

    // on, get, set make up the minimal implementation
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

    define.prefix = function(pref) {
      if (prefix) pref = prefix + '/' + pref;
      return makeDefine(pref + '/');
    };

    return define;
  }

  var localKissmd = makeDefine('');
  if (!window.kissmd) window.kissmd = localKissmd;

}());

