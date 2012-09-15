if (!window._vaccine) {
  // The minimal code required to be vaccine compliant.
  (function() {
    var waiting = {}, modules = {};
    window._vaccine = {
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
// Set your library with _vaccine.set('mylib', mylib);
