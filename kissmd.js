(function() {
  // Remove the above "(function() {" line if you are wrapping all the code
  // from your app or library inside a single function.

  var waiting = {},
      modules = {},
      globalKissmd;

  function makeDefine(prefix) {

    function define(originalId, defn) {
      var id = prefix + originalId,
          parts = id.split('/');

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
        var mod = define.get(reqId);
        if (!mod) {
          require.id = reqId;
          throw require;  // Throw require, to ensure correct error gets handled
        }
        return mod;
      }

      try {
        globalKissmd.set(id, defn(require));
      } catch (e) {
        if (e != require) throw e;
        globalKissmd.on(require.id, function() { define(originalId, defn); });
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

  var kissmd = makeDefine('');
  globalKissmd = window.kissmd || (window.kissmd = kissmd);



  // If you are using a globally available "kissmd" function then
  // uncomment and change the assignment below.
  //
  //    myApp.define = kissmd;
  //
  // If you are wrapping your app inside a single (function() { ... }())
  // then you can delete the ending "}());" line and uncomment
  // and change the assignment below. Alternatively, just use the
  // kissmd name directly (but make sure you never use the global version).
  //
  //    var myKissmd = kissmd;
  //

}());

