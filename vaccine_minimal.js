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
