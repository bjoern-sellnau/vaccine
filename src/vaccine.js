    function define(id, factory) {
      (vaccineFactories = vaccineFactories || {})[
???????????????????????????????????????????????????????????????????????? SIMPLE
        './' + id
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! SIMPLE
        id
######################################################################## SIMPLE
      ] = factory;
    }


    function require(id) {

      var
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! SIMPLE
          parts = id.split('/'),
######################################################################## SIMPLE
          module = {exports: {}};

      if (!vaccineLocalModules[id] && !vaccineWindow[id]) {
        vaccineFactories[id](
???????????????????????????????????????????????????????????????????????? SIMPLE
            require,
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! SIMPLE
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
######################################################################## SIMPLE
            module.exports, module);
        vaccineLocalModules[id] = module.exports;
      }
      return vaccineLocalModules[id] || vaccineWindow[id];
    }


    var vaccineFactories,
        vaccineLocalModules = {},
????????????????????????????????????????????????????????????????????? MULT_DEPS
        vaccineDependencies = [{{{ DEP_NAMES }}}],
##################################################################### MULT_DEPS
        vaccineWindow = window;

??????????????????????????????????????????????????????????????????????? SET_APP
 ???????????????????????????????????????????????????????????????????????? AMD
    if (typeof vaccineWindow.define == 'function' &&
        vaccineWindow.define.amd) {
      define('{{{ LIB_NAME }}}',
  ????????????????????????????????????????????????????????????????? ONE_DEP
          [{{{ DEP_NAMES }}}],
          function(vaccineSingleDep) {
            vaccineLocalModules.{{{ DEP_NAME }}} = vaccineSingleDep;
  ################################################################# ONE_DEP
  ??????????????????????????????????????????????????????????????? MULT_DEPS
          vaccineDependencies,
          function() {
            for (var i = 0, args = arguments; i < args.length; ++i) {
              vaccineLocalModules[vaccineDependencies[i]] = args[i];
            }
  ############################################################### MULT_DEPS
  ????????????????????????????????????????????????????????????????? NO_DEPS
          function() {
  ################################################################# NO_DEPS
  ?????????????????????????????????????????????????????????????????? SIMPLE
            return require('./index');
  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! SIMPLE
            return require('index');
  ################################################################## SIMPLE
          });
    } else {
 ######################################################################## AMD
      vaccineWindow.{{{ LIB_NAME }}} =
 ????????????????????????????????????????????????????????????????????? SIMPLE
          require('./index');
 !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! SIMPLE
          require('index');
 ##################################################################### SIMPLE
 ???????????????????????????????????????????????????????????????????????? AMD
    }
 ######################################################################## AMD
####################################################################### SET_APP
