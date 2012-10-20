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
    (vaccineFactories = vaccineFactories || {})[
vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv SIMPLE
      './' + id
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ SIMPLE
vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv COMPLEX
      id
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ COMPLEX
    ] = factory;
  }


  function require(id) {

    var
vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv COMPLEX
        parts = id.split('/'),
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ COMPLEX
        module = {exports: {}};

    if (!vaccineLocalModules[id] && !vaccineWindow[id]) {
      vaccineFactories[id](
vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv SIMPLE
          require,
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ SIMPLE
vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv COMPLEX
          function(reqId) {
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
          },
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ COMPLEX
          module.exports, module);
      vaccineLocalModules[id] = module.exports;
    }
    return vaccineLocalModules[id] || vaccineWindow[id];
  }


  var vaccineFactories,
      vaccineLocalModules = {},
vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv MULTIPLE_DEPS
      vaccineDependencies = [{{{ DEP_NAMES }}}],
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ MULTIPLE_DEPS
      vaccineWindow = window;

vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv SET_APP
 vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv AMD
  if (typeof vaccineWindow.define == 'function' &&
      vaccineWindow.define.amd) {
    define('{{{ APP_NAME }}}',
  vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv SINGLE_DEP
        [{{{ DEP_NAMES }}}],
        function(vaccineSingleDep) {
          vaccineLocalModules.{{{ DEP_NAME }}} = vaccineSingleDep;
  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ SINGLE_DEP
  vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv MULTIPLE_DEPS
        vaccineDependencies,
        function() {
          for (var i = 0, args = arguments; i < args.length; ++i) {
            vaccineLocalModules[vaccineDependencies[i]] = args[i];
          }
  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ MULTIPLE_DEPS
  vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv NO_DEPS
        function() {
  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ NO_DEPS
  vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv SIMPLE
          return require('./index');
  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ SIMPLE
  vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv COMPLEX
          return require('index');
  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ COMPLEX
        });
  } else {
 ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ AMD
    vaccineWindow.{{{ APP_NAME }}} =
 vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv SIMPLE
        require('./index');
 ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ SIMPLE
 vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv COMPLEX
        require('index');
 ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ COMPLEX
 vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv AMD
  }
 ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ AMD
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ SET_APP

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
