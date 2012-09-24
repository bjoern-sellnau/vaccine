
####################### LOADER START #######################
(function() {

  var appName = '{{{ APP_NAME }}}';   // Change this to your app name.

  // Change appMain to the location of your app's main/index file,
  // but without .js at the end.
  var appMain = '{{{ APP_MAIN }}}';

  // Change libraryDir to the directory of your pre-built library dependencies.
  var libraryDir = '{{{ LIBRARY_DIR }}}';


  // Figure out your app's main module based on the path to it (appMain).
  // Also determine the source directory.
  var appMainSplit = appMain.split('/'),
      appMainModule = appMainSplit.pop(),
      sourceDir = appMainSplit.join('/') || '.';


  // The scripts that are currently loading. Don't touch this.
  var loading = {};

>>>>>>>>>>>>>>>>>>>>>>>> LOADER END >>>>>>>>>>>>>>>>>>>>>>>>
  function define(id, defn) {

####################### MINIMAL START #######################
    if (!window.vaccine) {
      // The minimal code required to be vaccine compliant.
      (function() {
        var waiting = {}, modules = {};
        window.vaccine = {
          o: function(id, callback) {
            (waiting[id] = waiting[id] || []).push(callback);
          },
          g: function(id) {
            return modules[id];
          },
          s: function(id, val) {
            modules[id] = val;
            (waiting[id] || []).forEach(function(w) { w(); });
          }
        };
      }());
    }
    // Set your library with vaccine.s('mylib', mylib);
>>>>>>>>>>>>>>>>>>>>>>>> MINIMAL END >>>>>>>>>>>>>>>>>>>>>>>>

###################### RELATIVE START ######################
    var parts = id.split('/');
>>>>>>>>>>>>>>>>>>>>>>> RELATIVE END >>>>>>>>>>>>>>>>>>>>>>>

    var globalVaccine = window.vaccine,
        module = {exports: {}};

    function require(reqId) {

###################### RELATIVE START ######################
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
>>>>>>>>>>>>>>>>>>>>>>> RELATIVE END >>>>>>>>>>>>>>>>>>>>>>>
      var mod = globalVaccine.g(reqId);
#################### OUT_OF_ORDER START ####################
      if (!mod) {
        require.id = reqId;
        throw require;  // Throw require, to ensure correct error gets handled
      }
>>>>>>>>>>>>>>>>>>>>> OUT_OF_ORDER END >>>>>>>>>>>>>>>>>>>>>

      return mod;
    }

#################### OUT_OF_ORDER START ####################
    try {
>>>>>>>>>>>>>>>>>>>>> OUT_OF_ORDER END >>>>>>>>>>>>>>>>>>>>>
      defn(require, module.exports, module);
      globalVaccine.s(id, module.exports);
#################### OUT_OF_ORDER START ####################
    } catch (e) {
      if (e != require) throw e;
  ##################### LOADER START #####################

      var split = require.id.split('/'),
          root = split.shift(),
          src,
          script;
      if (root === appName) {
        if (!split.length) {
          split.push(appMainModule);
        }
        src = sourceDir + '/' + split.join('/');
      } else {
        src = libraryDir + '/' + root;
      }
      loadScript('/' + src + '.js');
  >>>>>>>>>>>>>>>>>>>>>> LOADER END >>>>>>>>>>>>>>>>>>>>>>
      globalVaccine.o(require.id, function() { define(id, defn); });
    }
>>>>>>>>>>>>>>>>>>>>> OUT_OF_ORDER END >>>>>>>>>>>>>>>>>>>>>
  }
####################### LOADER START #######################


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

  window.vaccine_load = function(src) {
    if (loaded) {
      loadScript(src);
    } else {
      initialScripts.push(src);
    }
  };

}());
>>>>>>>>>>>>>>>>>>>>>>>> LOADER END >>>>>>>>>>>>>>>>>>>>>>>>

