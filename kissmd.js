(function(kissmdName) {

  function makeDefine() {

    var modules = window.kissmd__modules,
        definitions = {},
        waiting = {},
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
      defineKnown(id);
    }
    define.require = require;

    function defineKnown(id) {
      var defn = definitions[id];
      try {
        modules[id] = defn(require);
        (waiting[id] || []).forEach(defineKnown);
      } catch (e) {
        if (e !== missingErr) throw e;
        waitId = missingErr.id;
        (waiting[waitId] = waiting[waitId] || []).push(id);
      }
    }

    return define;
  }

  if (!window.kissmd__modules) {
    window.kissmd__modules = {};
    window[kissmdName] = makeDefine();
  }

}('kissmd'));

