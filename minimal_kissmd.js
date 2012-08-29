(function() {
  var waiting = {}, modules = {};
  if (!window.kissmd) {
    window.kissmd = {
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
  }
}());
