(function(kissmdName) {

  var waiting;

  if (!window.kissmd__global) {
    waiting = {};
    window.kissmd__global = {
      modules: {},
      on: function(id, callback) {
        (waiting[id] = waiting[id] || []).push(callback);
      },
      trigger: function(id) {
        (waiting[id] || []).forEach(function(w) { w(); });
      }
    };
  }

  function makeDefine() {

    var global = window.kissmd__global,
        modules = global.modules,
        definitions = {},
        missingErr = {};

    function require(id) {
      if (!modules[id]) {
        missingErr.id = id;
        throw missingErr;
      }
      return modules[id];
    }

    function define(id, defn) {
      var waitId;
      definitions[id] = defn;
      try {
        modules[id] = defn(require);
        global.trigger(id);
      } catch (e) {
        if (e !== missingErr) throw e;
        waitId = missingErr.id;
        global.on(waitId, function() { define(id, defn); });
      }
    }
    define.require = require;

    return define;
  }

  window[kissmdName] = makeDefine();

}('kissmd'));

