????????????????????????????????????????????????????????????????? (performance)
    var vaccineFirstDefineTime,
        vaccineRequireStart,
        vaccineRequireEnd;

///////////////////////////////////////////////////////////////////////////////
    function define(id, factory) {
???????????????????????????????????????????????? (dev && define('optional_id'))
      if (!factory) {
        factory = id;
        id = vaccineOptionalId();
      }
///////////////////////////////////////////////////////////////////////////////
????????????????????????????????????????????????????????????????? (performance)
      vaccineFirstDefineTime = vaccineFirstDefineTime || Date.now();
///////////////////////////////////////////////////////////////////////////////
??????????????????????????????????????????????????????????????????????? (debug)
      if ((vaccineFactories || {})[$-- onlyRequire('single') ? "'./' + id" : 'id' --$]) {
        throw 'Attempting to redefine: ' + id;
      } else {
        console.log('Defining: ' + id);
      }
///////////////////////////////////////////////////////////////////////////////
      (vaccineFactories = vaccineFactories || {}
      )[$-- onlyRequire('single') ? "'./' + id" : (require('index') ? "id.replace(/\\/index$/, '')" : 'id') --$] = factory;
    }


    function require(id) {
????????????????????????????????????????????????????????????????? (performance)
      if (!vaccineRequireStart) {
        vaccineRequireStart = Date.now();
        var firstRequire = true;
      }

///////////////////////////////////////////////////////////////////////////////
??????????????????????????????????????????????????????????????????????? (debug)
      console.log('Resolving require as: ' + id);

///////////////////////////////////////////////////////////////////////////////
??????????????????????????????????????????????????????????????? require('full')
      var parts = id.split('/');
///////////////////////////////////////////////////////////////////////////////
????????????????????????????????????????????????????????????? exports('module')
      var module = {exports: {}};
:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  ?????????????????????????????????????????????????????? exports('exports')
      var exports = {};
  /////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

      if (!vaccineModules[id] && !vaccineWindow[id]) {
??????????????????????????????????????????????????????????????????????? (debug)
        if (vaccineFactories[id]) {
          console.log('Executing module factory: ' + id);
        } else {
          throw 'Missing module factory. Cannot execute: ' + id;
        }
///////////////////////////////////////////////////////////////////////////////
        $-- exports('return') ? 'vaccineModules[id] = ' : '' --$vaccineFactories[id](
??????????????????????????????????????????????????????????????? require('full')
            function(reqId) {
  ????????????????????????????????????????????????????????????????? (debug)
              console.log('Attempting to require: ' + reqId);
  ///////////////////////////////////////////////////////////////// (debug)
              var dots = /(\.?\.\/?)*/.exec(reqId)[0],
                  // Some code golf to get the number of "directories" back.
                  back = Math.floor(dots.replace(/\//g, '').length/1.9 + 0.99),
                  base;
              if (back) {
                base = parts.slice(0, parts.length - back).join('/');
                if (base) base += '/';
                reqId = base + reqId.slice(dots.length);
              }
              return require(reqId.replace(/\/$/, ''));
            }$-- exports('exports') ? ',' : ');' --$
:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  ???????????????????????????????? require('single') && require('absolute')
            function(reqId) {
              return require(reqId.replace('.', '$-- name --$'));
            }$-- exports('exports') ? ',' : ');' --$
  :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
            $-- exports('exports') ? 'require,' : 'require);' --$
  /////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
????????????????????????????????????????????????????????????? exports('return')
  ??????????????????????????????????????????????????????? exports('module')
            module.exports, module) || module.exports;
  :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
    ???????????????????????????????????????????????? exports('exports')
            exports) || exports;
    ///////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////
:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
            $-- exports('module') ? 'module.exports, module' : 'exports' --$);
        vaccineModules[id] = $-- exports('module') ? 'module.exports' : 'exports' --$;
///////////////////////////////////////////////////////////////////////////////
      }
??????????????????????????????????????????????????????????????????????? (debug)
      var moduleFoundWhere = vaccineModules[id] ? 'local' : 'window';
      console.log('Returning required ' + moduleFoundWhere + ' module: ' + id);
///////////////////////////////////////////////////////////////////////////////
????????????????????????????????????????????????????????????????? (performance)
      if (firstRequire) {
        vaccineRequireEnd = Date.now();
        console.log('Defined in: ' + (vaccineRequireStart - vaccineFirstDefineTime) + ' ms');
        console.log('Executed in: ' + (vaccineRequireEnd - vaccineRequireStart) + ' ms');
        console.log('Overall time: ' + (vaccineRequireEnd - vaccineFirstDefineTime) + ' ms');
      }
///////////////////////////////////////////////////////////////////////////////
      return vaccineModules[id] || vaccineWindow[id];
    }


    var vaccineFactories$-- dev ? ' = {}' : '' --$,
        vaccineModules = {},
?????????????????????????????????????????????? (numDeps > 1 && supports('amd'))
        vaccineDependencies = $-- depString --$,
///////////////////////////////////////////////////////////////////////////////
        vaccineWindow = window;

??????????????????????????????????????????????????????????????? supports('amd')
  ?????????????????????????????????????????????????????? supports('window')
    if (typeof vaccineWindow.define == 'function' &&
        vaccineWindow.define.amd) {
  /////////////////////////////////////////////////////////////////////////
      define('$-- name --$',
  ????????????????????????????????????????????????????????? (numDeps === 0)
             function() {
  ========================================================= (numDeps === 1)
             $-- depString --$,
             function(vaccineSingleDep) {
               vaccineModules.$-- dependencies[0] --$ = vaccineSingleDep;
  :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
             vaccineDependencies,
             function() {
               for (var i = 0, args = arguments; i < args.length; ++i) {
                 vaccineModules[vaccineDependencies[i]] = args[i];
               }
  /////////////////////////////////////////////////////////////////////////
               return require('$-- main --$');
             });
    $-- supports('window') ? '} else {' : '' --$
///////////////////////////////////////////////////////////////////////////////
???????????????????????????????????????????????????????????? supports('window')
      vaccineWindow.$-- global_name --$ = require('$-- main --$');
    $-- supports('amd') ? '}' : '' --$
///////////////////////////////////////////////////////////////////////////////
????????????????????????????????????????????????????????????????????????? (dev)
    var requireDev = function(main) {
      return require(main || '$-- main --$');
    };
  ??????????????????????????????????????????????????? define('optional_id')

    var vaccineOptionalId = function() {
      var loc = window.location,
          href = loc.protocol + '//' + loc.host,
          sourceDirRe = new RegExp('^' + href + '/$-- source_dir --$/'),
          scripts = document.getElementsByTagName('script');
      var idFromScript = function(script) {
        return script.src.replace(sourceDirRe, '').replace(/\.js$/, '');
      };
      scripts = Array.prototype.slice.call(scripts).filter(function(script) {
        if (!sourceDirRe.test(script.src)) return false;
        var id = idFromScript(script)
        return !vaccineFactories[$-- onlyRequire('single') ? "'./' + id" : 'id' --$];
      });
      return idFromScript(scripts[scripts.length - 1]);
    };
  /////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
