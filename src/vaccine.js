vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv LOADER
(function() {

  var appName = '{{{ APP_NAME }}}',       // Change this to your app name.
      sourceDir = '{{{ SOURCE_DIR }}}';   // Change this to... uh, your source directory.

  // Change libraryDir to the directory of your pre-built library dependencies.
  var libraryDir = '{{{ LIBRARY_DIR }}}';


  // The scripts that are currently loading. Don't touch this.
  var loading = {};

^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ LOADER

  function define(id, factory) {
    (vaccineFactories = vaccineFactories || {})[id] = factory;
  }


  function require(id) {

    var
vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv COMPLEX_RELATIVE
        parts = id.split('/'),
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ COMPLEX_RELATIVE
        module = {exports: {}};

    if (!vaccineLocalModules[id] && !vaccineGlobal.m[id]) {
      vaccineFactories[id](function(reqId) {
vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv SIMPLE_RELATIVE
        return require(reqId.replace('.', vaccineAppName));
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ SIMPLE_RELATIVE
vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv COMPLEX_RELATIVE
        var matching = /(\.?\.\/?)*/.exec(reqId)[0],
            // Some code golf to get the number of "directories" back we want to go
            back = Math.floor(matching.replace(/\//g, '').length / 1.9 + 0.99),
            base;
        if (back) {
          base = parts.slice(0, parts.length - back).join('/');
          if (base) base += '/';
          reqId = base + reqId.slice(matching.length);
        }
        return require(reqId.replace(/\/$/, ''));
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ COMPLEX_RELATIVE
      }, module.exports, module);
      vaccineLocalModules[id] = module.exports;
    }
    return vaccineLocalModules[id] || vaccineGlobal.m[id];
  }

  vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv LOADER

      var split = require.id.split('/'),
          root = split.shift(),
          src,
          script;
      if (root === appName) {
        src = sourceDir + '/' + split.join('/');
      } else {
        src = libraryDir + '/' + root;
      }
      loadScript('/' + src + '.js');
  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ LOADER

  var vaccineFactories,
      vaccineAppName = '{{{ APP_NAME }}}',
      vaccineLocalModules = {},
vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv SINGLE_DEP
      vaccineDependency = '{{{ DEP_NAME }}}',
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ SINGLE_DEP
vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv MULTIPLE_DEPS
      vaccineDependencies = {{{ DEP_NAMES }}},
      vaccineRemainingDeps = vaccineDependencies.length,
      vaccineRunDefines = function() { --vaccineRemainingDeps || vaccineSetApp(); },
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ MULTIPLE_DEPS
      vaccineGlobal =
vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv MINIMAL
      window.vaccine || (window.vaccine = {
        // The minimal code required to be vaccine compliant.

        // w = waiting: Functions to be called when a modules
        // gets defined. w[moduleId] = [array of functions];
        w: {},

        // m = modules: Modules that have been fully defined.
        // m[moduleId] = module.exports value
        m: {},

        // s = set: When a module becomes fully defined, set
        // the module.exports value here.
        // s(moduleId, module.exports)
        s: function(id, val) {
          this.m[id] = val;
          (this.w[id] || []).forEach(function(w) { w(); });
        }
      });
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ MINIMAL

vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv HAS_DEPS
  function vaccineSetApp() {
    vaccineDefines();
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ HAS_DEPS
  vaccineGlobal.s(vaccineAppName, require(vaccineAppName));
vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv HAS_DEPS
  }
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ HAS_DEPS

vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv SINGLE_DEP
  if (vaccineGlobal.m[vaccineDependency]) vaccineSetApp();
  else  (vaccineGlobal.w[vaccineDependency] ||
          (vaccineGlobal.w[vaccineDependency] = [])
        ).push(vaccineSetApp);
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ SINGLE_DEP
vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv MULTIPLE_DEPS
  vaccineDependencies.forEach(function(d) {
    if (vaccineGlobal.m[d]) --vaccineRemainingDeps;
    else  (vaccineGlobal.w[d] ||
            (vaccineGlobal.w[d] = [])
          ).push(vaccineRunDefines);
  });
  if (!vaccineRemainingDeps) vaccineSetApp();
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ MULTIPLE_DEPS

vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv LOADER


  function loadScript(src) {
    if (!loading[src]) {
      loading[src] = src;
      script = document.createElement('script');
      script.src = src;
      document.head.appendChild(script);
    }
  }

  window.define = define;


  var initialScripts = [],
      loaded = false;

  // The first define, which will trigger the loading of your app,
  // and any other initial scripts.
  define('initial_scripts', function(require) {

    // Pull in your app and all it's dependencies.
    require(appName);

    loaded = true;

    // Load initial scripts after the main app is loaded.
    initialScripts.forEach(function(src) { loadScript(src); });
  });

  window.vaccine_load = function() {
    Array.prototype.slice.apply(arguments).forEach(function(src) {
      if (loaded) {
        loadScript(src);
      } else {
        initialScripts.push(src);
      }
    });
  };

}());
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ LOADER
