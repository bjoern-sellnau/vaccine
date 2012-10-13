####################### LOADER START #######################
(function() {

  var appName = '{{{ APP_NAME }}}',       // Change this to your app name.
      sourceDir = '{{{ SOURCE_DIR }}}';   // Change this to... uh, your source directory.

  // Change libraryDir to the directory of your pre-built library dependencies.
  var libraryDir = '{{{ LIBRARY_DIR }}}';


  // The scripts that are currently loading. Don't touch this.
  var loading = {};

>>>>>>>>>>>>>>>>>>>>>>>> LOADER END >>>>>>>>>>>>>>>>>>>>>>>>
##################### PER_LIB_DEPS START #####################
    var
##################### SINGLE_DEP START #####################
        vaccineSingleDependency = '{{{ DEP_NAME }}}',
>>>>>>>>>>>>>>>>>>>>>> SINGLE_DEP END >>>>>>>>>>>>>>>>>>>>>>
        globalVaccine =
----------------------- MINIMAL INSERT -----------------------
>>>>>>>>>>>>>>>>>>>>>> PER_LIB_DEPS END >>>>>>>>>>>>>>>>>>>>>>
  function define(id, defn) {

    var globalVaccine =
#################### PER_MODULE_DEPS START ####################
------------------------ MINIMAL INSERT -----------------------
>>>>>>>>>>>>>>>>>>>>> PER_MODULE_DEPS END >>>>>>>>>>>>>>>>>>>>>

###################### RELATIVE START ######################
    var parts = id.split('/');
>>>>>>>>>>>>>>>>>>>>>>> RELATIVE END >>>>>>>>>>>>>>>>>>>>>>>

    var module = {exports: {}};

    function require(reqId) {

################### SIMPLE_RELATIVE START ###################
      reqId = reqId.replace('.', '{{{ APP_NAME }}}');
>>>>>>>>>>>>>>>>>>>> SIMPLE_RELATIVE END >>>>>>>>>>>>>>>>>>>>
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
      var mod = globalVaccine.m[reqId];
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
######################## INDEX START ########################
      if (id.match(/\/index$/)) {
        globalVaccine.s(id.replace(/\/index$/, ''), module.exports);
      }
>>>>>>>>>>>>>>>>>>>>>>>>> INDEX END >>>>>>>>>>>>>>>>>>>>>>>>>
#################### OUT_OF_ORDER START ####################
    } catch (e) {
      if (e != require) throw e;
  ##################### LOADER START #####################

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
  >>>>>>>>>>>>>>>>>>>>>> LOADER END >>>>>>>>>>>>>>>>>>>>>>
      (globalVaccine.w[require.id] || (globalVaccine.w[require.id] = []))
          .push(function() { define(id, defn); });
    }
>>>>>>>>>>>>>>>>>>>>> OUT_OF_ORDER END >>>>>>>>>>>>>>>>>>>>>
  }
##################### PER_LIB_DEPS START #####################

  if (globalVaccine.m[vaccineSingleDependency]) vaccineDefines();
  else  (globalVaccine.w[vaccineSingleDependency] ||
          (globalVaccine.w[vaccineSingleDependency] = [])
        ).push(vaccineDefines);
>>>>>>>>>>>>>>>>>>>>>> PER_LIB_DEPS END >>>>>>>>>>>>>>>>>>>>>>
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
>>>>>>>>>>>>>>>>>>>>>>>> LOADER END >>>>>>>>>>>>>>>>>>>>>>>>
