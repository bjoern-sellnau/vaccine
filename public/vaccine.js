(function() {
define('hijs', function(require, exports, module) {
//
// hijs - JavaScript Syntax Highlighter
//
// Copyright (c) 2010 Alexis Sellier
//
// Edited to suit vaccinejs.com by Jake Sandlund


var keywords = ('var function if else for while break switch case do new null in with void '
               +'continue delete return this true false throw catch typeof with instanceof '
               +'echo cat find done sed').split(' '),
    special = ('eval window document undefined NaN Infinity parseInt parseFloat '
               +'encodeURI decodeURI encodeURIComponent decodeURIComponent').split(' ');

// Syntax definition
// The key becomes the class name of the <span>
// around the matched block of code.
var syntax = [
  ['comment', /(\/\*(?:[^*\n]|\*+[^\/*])*\*+\/)/g],
  ['comment', /(\/\/[^\n]*)/g],
  ['comment', /(# [^\n]*)/g],
  ['string' , /("(?:(?!")[^\\\n]|\\.)*"|'(?:(?!')[^\\\n]|\\.)*')/g],
  ['regexp' , /(\/.+\/[mgi]*)(?!\s*\w)/g],
  ['class' , /\b([A-Z][a-zA-Z]+)\b/g],
  ['number' , /\b([0-9]+(?:\.[0-9]+)?)\b/g],
  ['keyword', new(RegExp)('\\b(' + keywords.join('|') + ')\\b', 'g')],
  ['special', new(RegExp)('\\b(' + special.join('|') + ')\\b', 'g')]
];

var table;

module.exports = function(code) {

  table = {};

  if (! /^\$\s/.test(code.trim())) {
      syntax.forEach(function (s) {
          var k = s[0], v = s[1];
          code = code.replace(v, function (_, m) {
              return '\u00ab' + encode(k) + '\u00b7'
                              + encode(m) +
                    '\u00b7' + encode(k) + '\u00bb';
          });
      });
  }
  return code.replace(/\u00ab(.+?)\u00b7(.+?)\u00b7\1\u00bb/g, function (_, name, value) {
      value = value.replace(/\u00ab[^\u00b7]+\u00b7/g, '').replace(/\u00b7[^\u00bb]+\u00bb/g, '');
      return '<span class="' + decode(name) + '">' + escape(decode(value)) + '</span>';
  });
};


function escape(str) {
    return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Encode ASCII characters to, and from Braille
function encode (str, encoded) {
    table[encoded = str.split('').map(function (s) {
        if (s.charCodeAt(0) > 127) { return s }
        return String.fromCharCode(s.charCodeAt(0) + 0x2800);
    }).join('')] = str;
    return encoded;
}
function decode (str) {
    if (str in table) {
        return table[str];
    } else {
        return str.trim().split('').map(function (s) {
            if (s.charCodeAt(0) - 0x2800 > 127) { return s }
            return String.fromCharCode(s.charCodeAt(0) - 0x2800);
        }).join('');
    }
}
});
define('jsdiff', function(require, exports, module) {
/* See LICENSE file for terms of use */

/*
 * Text diff implementation.
 * 
 * This library supports the following APIS:
 * JsDiff.diffChars: Character by character diff
 * JsDiff.diffWords: Word (as defined by \b regex) diff which ignores whitespace
 * JsDiff.diffLines: Line based diff
 * 
 * JsDiff.diffCss: Diff targeted at CSS content
 * 
 * These methods are based on the implementation proposed in
 * "An O(ND) Difference Algorithm and its Variations" (Myers, 1986).
 * http://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.4.6927
 */
var JsDiff = (function() {
  function clonePath(path) {
    return { newPos: path.newPos, components: path.components.slice(0) };
  }
  function removeEmpty(array) {
    var ret = [];
    for (var i = 0; i < array.length; i++) {
      if (array[i]) {
        ret.push(array[i]);
      }
    }
    return ret;
  }
  function escapeHTML(s) {
    var n = s;
    n = n.replace(/&/g, "&amp;");
    n = n.replace(/</g, "&lt;");
    n = n.replace(/>/g, "&gt;");
    n = n.replace(/"/g, "&quot;");

    return n;
  }

  var fbDiff = function(ignoreWhitespace) {
    this.ignoreWhitespace = ignoreWhitespace;
  };
  fbDiff.prototype = {
      diff: function(oldString, newString) {
        // Handle the identity case (this is due to unrolling editLength == 0
        if (newString == oldString) {
          return [{ value: newString }];
        }
        if (!newString) {
          return [{ value: oldString, removed: true }];
        }
        if (!oldString) {
          return [{ value: newString, added: true }];
        }

        newString = this.tokenize(newString);
        oldString = this.tokenize(oldString);

        var newLen = newString.length, oldLen = oldString.length;
        var maxEditLength = newLen + oldLen;
        var bestPath = [{ newPos: -1, components: [] }];

        // Seed editLength = 0
        var oldPos = this.extractCommon(bestPath[0], newString, oldString, 0);
        if (bestPath[0].newPos+1 >= newLen && oldPos+1 >= oldLen) {
          return bestPath[0].components;
        }

        for (var editLength = 1; editLength <= maxEditLength; editLength++) {
          for (var diagonalPath = -1*editLength; diagonalPath <= editLength; diagonalPath+=2) {
            var basePath;
            var addPath = bestPath[diagonalPath-1],
                removePath = bestPath[diagonalPath+1];
            oldPos = (removePath ? removePath.newPos : 0) - diagonalPath;
            if (addPath) {
              // No one else is going to attempt to use this value, clear it
              bestPath[diagonalPath-1] = undefined;
            }

            var canAdd = addPath && addPath.newPos+1 < newLen;
            var canRemove = removePath && 0 <= oldPos && oldPos < oldLen;
            if (!canAdd && !canRemove) {
              bestPath[diagonalPath] = undefined;
              continue;
            }

            // Select the diagonal that we want to branch from. We select the prior
            // path whose position in the new string is the farthest from the origin
            // and does not pass the bounds of the diff graph
            if (!canAdd || (canRemove && addPath.newPos < removePath.newPos)) {
              basePath = clonePath(removePath);
              this.pushComponent(basePath.components, oldString[oldPos], undefined, true);
            } else {
              basePath = clonePath(addPath);
              basePath.newPos++;
              this.pushComponent(basePath.components, newString[basePath.newPos], true, undefined);
            }

            var oldPos = this.extractCommon(basePath, newString, oldString, diagonalPath);

            if (basePath.newPos+1 >= newLen && oldPos+1 >= oldLen) {
              return basePath.components;
            } else {
              bestPath[diagonalPath] = basePath;
            }
          }
        }
      },

      pushComponent: function(components, value, added, removed) {
        var last = components[components.length-1];
        if (last && last.added === added && last.removed === removed) {
          // We need to clone here as the component clone operation is just
          // as shallow array clone
          components[components.length-1] =
            {value: this.join(last.value, value), added: added, removed: removed };
        } else {
          components.push({value: value, added: added, removed: removed });
        }
      },
      extractCommon: function(basePath, newString, oldString, diagonalPath) {
        var newLen = newString.length,
            oldLen = oldString.length,
            newPos = basePath.newPos,
            oldPos = newPos - diagonalPath;
        while (newPos+1 < newLen && oldPos+1 < oldLen && this.equals(newString[newPos+1], oldString[oldPos+1])) {
          newPos++;
          oldPos++;

          this.pushComponent(basePath.components, newString[newPos], undefined, undefined);
        }
        basePath.newPos = newPos;
        return oldPos;
      },

      equals: function(left, right) {
        var reWhitespace = /\S/;
        if (this.ignoreWhitespace && !reWhitespace.test(left) && !reWhitespace.test(right)) {
          return true;
        } else {
          return left == right;
        }
      },
      join: function(left, right) {
        return left + right;
      },
      tokenize: function(value) {
        return value;
      }
  };

  var CharDiff = new fbDiff();

  var WordDiff = new fbDiff(true);
  WordDiff.tokenize = function(value) {
    return removeEmpty(value.split(/(\s+|\b)/));
  };

  var CssDiff = new fbDiff(true);
  CssDiff.tokenize = function(value) {
    return removeEmpty(value.split(/([{}:;,]|\s+)/));
  };

  var LineDiff = new fbDiff();
  LineDiff.tokenize = function(value) {
    return value.split(/^/m);
  };

  return {
    diffChars: function(oldStr, newStr) { return CharDiff.diff(oldStr, newStr); },
    diffWords: function(oldStr, newStr) { return WordDiff.diff(oldStr, newStr); },
    diffLines: function(oldStr, newStr) { return LineDiff.diff(oldStr, newStr); },

    diffCss: function(oldStr, newStr) { return CssDiff.diff(oldStr, newStr); },

    createPatch: function(fileName, oldStr, newStr, oldHeader, newHeader) {
      var ret = [];

      ret.push("Index: " + fileName);
      ret.push("===================================================================");
      ret.push("--- " + fileName + (typeof oldHeader === "undefined" ? "" : "\t" + oldHeader));
      ret.push("+++ " + fileName + (typeof newHeader === "undefined" ? "" : "\t" + newHeader));

      var diff = LineDiff.diff(oldStr, newStr);
      if (!diff[diff.length-1].value) {
        diff.pop();   // Remove trailing newline add
      }
      diff.push({value: "", lines: []});   // Append an empty value to make cleanup easier

      function contextLines(lines) {
        return lines.map(function(entry) { return ' ' + entry; });
      }
      function eofNL(curRange, i, current) {
        var last = diff[diff.length-2],
            isLast = i === diff.length-2,
            isLastOfType = i === diff.length-3 && (current.added !== last.added || current.removed !== last.removed);

        // Figure out if this is the last line for the given file and missing NL
        if (!/\n$/.test(current.value) && (isLast || isLastOfType)) {
          curRange.push('\\ No newline at end of file');
        }
      }

      var oldRangeStart = 0, newRangeStart = 0, curRange = [],
          oldLine = 1, newLine = 1;
      for (var i = 0; i < diff.length; i++) {
        var current = diff[i],
            lines = current.lines || current.value.replace(/\n$/, "").split("\n");
        current.lines = lines;

        if (current.added || current.removed) {
          if (!oldRangeStart) {
            var prev = diff[i-1];
            oldRangeStart = oldLine;
            newRangeStart = newLine;

            if (prev) {
              curRange = contextLines(prev.lines.slice(-4));
              oldRangeStart -= curRange.length;
              newRangeStart -= curRange.length;
            }
          }
          curRange.push.apply(curRange, lines.map(function(entry) { return (current.added?"+":"-") + entry; }));
          eofNL(curRange, i, current);

          if (current.added) {
            newLine += lines.length;
          } else {
            oldLine += lines.length;
          }
        } else {
          if (oldRangeStart) {
            // Close out any changes that have been output (or join overlapping)
            if (lines.length <= 8 && i < diff.length-2) {
              // Overlapping
              curRange.push.apply(curRange, contextLines(lines));
            } else {
              // end the range and output
              var contextSize = Math.min(lines.length, 4);
              ret.push(
                  "@@ -" + oldRangeStart + "," + (oldLine-oldRangeStart+contextSize)
                  + " +" + newRangeStart + "," + (newLine-newRangeStart+contextSize)
                  + " @@");
              ret.push.apply(ret, curRange);
              ret.push.apply(ret, contextLines(lines.slice(0, contextSize)));
              if (lines.length <= 4) {
                eofNL(ret, i, current);
              }

              oldRangeStart = 0;  newRangeStart = 0; curRange = [];
            }
          }
          oldLine += lines.length;
          newLine += lines.length;
        }
      }

      return ret.join('\n') + '\n';
    },

    applyPatch: function(oldStr, uniDiff) {
      var diffstr = uniDiff.split("\n");
      var diff = [];
      var remEOFNL = false,
          addEOFNL = false;

      for (var i = (diffstr[0][0]=="I"?4:0); i < diffstr.length; i++) {
        if(diffstr[i][0] == "@") {
          var meh = diffstr[i].split(/@@ -(\d+),(\d+) \+(\d+),(\d+) @@/);
          diff.unshift({
            start:meh[3],
            oldlength:meh[2],
            oldlines:[],
            newlength:meh[4],
            newlines:[]
          });
        } else if(diffstr[i][0] == '+') {
          diff[0].newlines.push(diffstr[i].substr(1));
        } else if(diffstr[i][0] == '-') {
          diff[0].oldlines.push(diffstr[i].substr(1));
        } else if(diffstr[i][0] == ' ') {
          diff[0].newlines.push(diffstr[i].substr(1));
          diff[0].oldlines.push(diffstr[i].substr(1));
        } else if(diffstr[i][0] == '\\') {
          if (diffstr[i-1][0] == '+') {
            remEOFNL = true;
          } else if(diffstr[i-1][0] == '-') {
            addEOFNL = true;
          }
        }
      }

      var str = oldStr.split("\n");
      for (var i = diff.length - 1; i >= 0; i--) {
        var d = diff[i];
        for (var j = 0; j < d.oldlength; j++) {
          if(str[d.start-1+j] != d.oldlines[j]) {
            return false;
          }
        }
        Array.prototype.splice.apply(str,[d.start-1,+d.oldlength].concat(d.newlines));
      }

      if (remEOFNL) {
        while (!str[str.length-1]) {
          str.pop();
        }
      } else if (addEOFNL) {
        str.push('');
      }
      return str.join('\n');
    },

    convertChangesToXML: function(changes){
      var ret = [];
      for ( var i = 0; i < changes.length; i++) {
        var change = changes[i];
        if (change.added) {
          ret.push("<ins>");
        } else if (change.removed) {
          ret.push("<del>");
        }

        ret.push(escapeHTML(change.value));

        if (change.added) {
          ret.push("</ins>");
        } else if (change.removed) {
          ret.push("</del>");
        }
      }
      return ret.join("");
    },

    // See: http://code.google.com/p/google-diff-match-patch/wiki/API
    convertChangesToDMP: function(changes){
      var ret = [], change;
      for ( var i = 0; i < changes.length; i++) {
        change = changes[i];
        ret.push([(change.added ? 1 : change.removed ? -1 : 0), change.value]);
      }
      return ret;
    }
  };
})();

if (typeof module !== "undefined") {
    module.exports = JsDiff;
}
});
define('vaccine', function(require, exports, module) {
'use strict';

var templateFiles = ['vaccine.js', 'Makefile', 'build.sh', 'dev_server.js'],
    templateText = {},
    conditionals = {};

var templateMap = {
  'vaccine.js': 'vaccine.js',
  'Makefile': 'Makefile',
  'build.sh': 'build.sh',
  'dev_server.js': 'dev_server.js',
  'vaccine_dev.js': 'vaccine.js',
};

var macroMap = {
  '?????': 'if',
  '=====': 'elsif',
  '/////': 'end',
  ':::::': 'else',
};

var name,
    globalName,
    libraryDir,
    commonJS,
    performance,
    debug,
    dev,
    devPerformance,
    devDebug,
    useStrict,
    dependencies = [],
    depString,
    numDeps,
    dirs,
    supportsArray,
    exportsArray,
    targets,
    sourceDir,
    main;

var has = function(array, item) {
  return array.indexOf(item) >= 0;
};

var exprts = function(exprtsType) {
  return has(exportsArray, exprtsType);
};

var supports = function(supportsType) {
  return has(supportsArray, supportsType);
};

module.exports = exports = function(options) {

  setOptions(options);

  return targets.map(function(target) {
    if (target === 'vaccine_dev.js') {
      var old = {
        debug: debug,
        performance: performance,
        supportsArray: supportsArray
      };
      dev = true;
      debug = devDebug;
      performance = devPerformance;
      supportsArray = [];
    }
    var compiled = compileTemplate(templateMap[target]);
    if (target === 'vaccine_dev.js') {
      dev = false;
      debug = old.debug;
      performance = old.performance;
      supportsArray = old.supportsArray;
    }
    return {name: target, compiled: compiled};
  });
};

var setOptions = function(options) {
  name = options.name;
  globalName = options.global || name;
  libraryDir = options.lib;
  commonJS = options.commonjs;
  performance = options.performance;
  debug = options.debug;
  devDebug = !options.dev_no_debug;
  devPerformance = !options.dev_no_performance;
  useStrict = options.use_strict;
  dependencies = options.dependencies || [];
  numDeps = dependencies.length;
  depString = "['" + dependencies.join("', '") + "']";
  dirs = options.dirs;
  supportsArray = options.supports || ['amd', 'window'];
  exportsArray = options.exports || ['module', 'exports'];
  targets = options.targets || ['vaccine.js', 'build.sh'];

  if (exprts('module') && !exprts('exports')) exportsArray.push('exports');
  if (!exportsArray.length) exportsArray.push('exports');

  var cleanedMain = options.main.replace(/^\.\//, '').replace(/\.js$/, '');
  if (options.src) {
    sourceDir = options.src.replace(/^\.\//, '');
  } else {
    var mainSplit = cleanedMain.split('/');
    mainSplit.pop();
    sourceDir = mainSplit.join('/') || '.';
  }
  main = cleanedMain.replace(new RegExp('^' + sourceDir + '/'), '');
};


var compileTemplate = function(templateName) {
  var template = templateText[templateName],
      stack = [],
      top = {enabled: true},
      enabled = true,
      stackEnabled = true,
      first = true,
      compiled = '';

  template.split('\n').forEach(function(line) {
    var match = line.match(/([?\/=:]{5})( .*)?$/);
    if (match) {
      var type = macroMap[match[1]];
      if (type === 'end' || type === 'if') {
        if (type === 'end') top = stack.pop();
        if (type === 'if') {
          stack.push(top);
          top = {};
        }
        stackEnabled = stack.every(function(d) { return d.enabled; });
      }
      if (stackEnabled && type !== 'end') {
        if (top.wasTrue) {
          top.enabled = false;
        } else {
          if (type === 'else') {
            top.enabled = true;
          } else {
            top.enabled = evaluate(match[2]);
          }
        }
        top.wasTrue = top.wasTrue || top.enabled;
      }
      enabled = stackEnabled && top.enabled;
    } else {
      if (enabled) {
        var compiledLine = line.replace(/\$--(.*?)--\$/g, function(match, group) {
          return eval(group);
        });
        compiled += compiledLine.replace(/^    /, '') + '\n';
      }
    }
  });
  return compiled.slice(0, -1);   // Remove last newline.
};

var evaluate = function(string) {
  return eval(string);
};


exports.templateText = function(_) {
  if (!_) return templateText;
  templateText = _;
};

// Only use outside of the browser.
exports.loadFiles = function() {
  var fs = require('fs');
  templateFiles.forEach(function(file) {
    templateText[file] = fs.readFileSync(__dirname + '/../templates/' + file, 'utf8');
  });
};
});
define('web', function(require, exports, module) {
var d3 = require('d3'),
    hijs = require('./hijs'),
    jsdiff = require('./jsdiff'),
    vaccine = require('./vaccine'),
    templateText = require('./templates');

var prepend = function(text, pre) {
  var split = text.split('\n');
  split.pop();
  return pre + split.join('\n' + pre);
};

var diff = function(old, next) {
  // Reverse the next and old so that removed lines show before added.
  var chunks = jsdiff.diffLines(next, old).map(function(d) {
    if (d.removed) {
      return '<span class="added">' + prepend(d.value, '+') + '</span>';
    } else if (d.added) {
      return '<span class="removed">' + prepend(d.value, '-') + '</span>';
    } else {
      return prepend(d.value, ' ');
    }
  });
  return chunks.join('\n');
};

vaccine.templateText(templateText);

var configHolder = d3.select('#config'),
    currentOptions = {},
    currentCompiled,
    savedOptions,
    savedCompiled,
    savedCompiledMap,
    diffEnabled = false;

var defaultOptions = {
  format: 'amd',
  name: 'my_library_name',
  main: 'src/index.js',
  dependencies: ['dep_one', 'dep_two'],
  dirs: '1',
  targets: ['vaccine.js', 'build.sh'],
  exports: ['exports', 'module', 'return'],
  supports: ['amd', 'window'],
  debugging: [],
  src: '',
  global: '',
};

var maybeUpdate = function() {
  var options = getOptions();
  var same = Object.keys(options).every(function(key) {
    var next = options[key];
    if (!Array.isArray(next)) {
      return next === currentOptions[key];
    }
    var current = currentOptions[key];
    if (current.length !== next.length) return false;
    return !next.filter(function(d) { return current.indexOf(d) < 0; }).length;
  });
  if (same) return false;
  currentOptions = options;
  update();
  return false;
};

var getOptions = function() {
  var options = {};
  configHolder.selectAll('.inputs input').each(function() {
    if (this.type === 'checkbox') {
      options[this.name] = options[this.name] || [];
      if (this.checked) options[this.name].push(this.value);
    } else if (this.type !== 'radio' || this.checked) {
      options[this.name] = this.value;
    }
  });
  return options;
};

var setOptions = function(options) {
  configHolder.selectAll('.inputs input').each(function() {
    var current = options[this.name];
    if (this.type === 'checkbox') {
      this.checked = current.indexOf(this.value) >= 0;
    } else if (this.type === 'radio') {
      this.checked = current === this.value;
    } else {
      this.value = current;
    }
  });
};

var update = function() {
  configHolder.select('#save').attr('disabled', null);
  currentCompiled = compile(currentOptions);
  updateSources();
};

var compile = function(rawOptions) {
  var options = {};
  Object.keys(rawOptions).forEach(function(k) { options[k] = rawOptions[k]; });
  var deps = [];
  options.dependencies.split(/\W+/).forEach(function(dep) {
    if (dep) deps.push(dep);
  });
  options.dependencies = deps;

  var debugging = options.debugging;
  options.debug = debugging.indexOf('debug') >= 0;
  options.performance = debugging.indexOf('performance') >= 0;
  options.use_strict = debugging.indexOf('use-strict') >= 0;
  options.commonjs = options.format === 'commonjs';

  return vaccine(options);
};

var updateSources = function() {
  currentCompiled.forEach(function(d) {
    if (diffEnabled) {
      d.html = diff(savedCompiledMap[d.name], d.compiled);
    } else {
      d.html = hijs(d.compiled);
    }
  });
  var sources = d3.select('#sources').selectAll('.source')
      .data(currentCompiled, function(d) { return d.name; });

  sources.enter().append('div')
      .attr('class', 'source')
      .each(function(d) {
        source = d3.select(this);
        source.append('div')
            .attr('class', 'title')
            .text(d.name);
        source.append('div')
            .attr('class', 'code-container')
            .append('code');
      });

  sources.exit().remove();

  var order = ['vaccine.js', 'build.sh', 'Makefile',
               'vaccine_dev.js', 'dev_server.js'];
  sources.sort(function(a, b) {
    return order.indexOf(a.name) - order.indexOf(b.name);
  });

  sources.select('code').html(function(d) { return d.html; });
};

var toggleDiff = function() {
  diffEnabled = !diffEnabled;
  configHolder.select('#diff').classed('active', diffEnabled);
  updateSources();
};

var makeCompiledMap = function(compiled) {
  var map = {};
  compiled.forEach(function(d) { map[d.name] = d.compiled; });
  return map;
};

var saveCurrent = function() {
  savedCompiled = currentCompiled;
  savedCompiledMap = makeCompiledMap(currentCompiled);
  savedOptions = currentOptions;
  configHolder.select('#save').attr('disabled', 'disabled');
  if (diffEnabled) updateSources();
};

var swapSaved = function() {
  if (!savedOptions) return;
  var options = currentOptions,
      compiled = currentCompiled;
  currentOptions = savedOptions;
  currentCompiled = savedCompiled;
  savedOptions = options;
  savedCompiled = compiled;
  savedCompiledMap = makeCompiledMap(compiled);
  setOptions(currentOptions);
  updateSources();
};

var changeFormat = function() {
  var amd = (this.value === 'amd' && this.checked) || !this.checked;
  var options = getOptions();
  if (amd) {
    options.exports = ['exports', 'module', 'return'];
  } else {
    options.exports = ['exports', 'module'];
  }
  setOptions(options);
};

configHolder.selectAll('#format input').each(function() {
  d3.select(this).on('click', changeFormat);
});
configHolder.on('click', maybeUpdate);
configHolder.on('keyup', maybeUpdate);
configHolder.select('#diff').on('click', toggleDiff);
configHolder.select('#save').on('click', saveCurrent);
configHolder.select('#swap').on('click', swapSaved);

setOptions(defaultOptions);
maybeUpdate();
saveCurrent();
});
define('templates', function(require, exports, module) {
module.exports = ({"vaccine.js":"????????????????????????????????????????????????????????????????? (performance)\n    var vaccineFirstDefineTime,\n        vaccineRequireStart,\n        vaccineRequireEnd;\n\n///////////////////////////////////////////////////////////////////////////////\n    function define(id, factory) {\n????????????????????????????????????????????????????????????????? (performance)\n      vaccineFirstDefineTime = vaccineFirstDefineTime || Date.now();\n///////////////////////////////////////////////////////////////////////////////\n??????????????????????????????????????????????????????????????????????? (debug)\n      if ((vaccineFactories || {})[$-- dirs > 1 ? 'id' : \"'./' + id\" --$]) {\n        throw 'Attempting to redefine: ' + id;\n      } else {\n        console.log('Defining: ' + id);\n      }\n///////////////////////////////////////////////////////////////////////////////\n      (vaccineFactories = vaccineFactories || {})[$-- dirs > 1 ? 'id' : \"'./' + id\" --$] = factory;\n    }\n\n\n    function require(id) {\n????????????????????????????????????????????????????????????????? (performance)\n      if (!vaccineRequireStart) {\n        vaccineRequireStart = Date.now();\n        var firstRequire = true;\n      }\n\n///////////////////////////////////////////////////////////////////////////////\n??????????????????????????????????????????????????????????????????????? (debug)\n      console.log('Resolving require as: ' + id);\n\n///////////////////////////////////////////////////////////////////////////////\n???????????????????????????????????????????????????????????????????? (dirs > 1)\n      var parts = id.split('/');\n///////////////////////////////////////////////////////////////////////////////\n?????????????????????????????????????????????????????????????? exprts('module')\n      var module = {exports: {}};\n:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::\n  ??????????????????????????????????????????????????????? exprts('exports')\n      var exports = {};\n  /////////////////////////////////////////////////////////////////////////\n///////////////////////////////////////////////////////////////////////////////\n\n      if (!vaccineModules[id] && !vaccineWindow[id]) {\n??????????????????????????????????????????????????????????????????????? (debug)\n        if (vaccineFactories[id]) {\n          console.log('Executing module factory: ' + id);\n        } else {\n          throw 'Missing module factory. Cannot execute: ' + id;\n        }\n///////////////////////////////////////////////////////////////////////////////\n        $-- exprts('return') ? 'vaccineModules[id] = ' : '' --$vaccineFactories[id](\n???????????????????????????????????????????????????????????????????? (dirs > 1)\n            function(reqId) {\n  ????????????????????????????????????????????????????????????????? (debug)\n              console.log('Attempting to require: ' + reqId);\n  ///////////////////////////////////////////////////////////////// (debug)\n              var matching = /(\\.?\\.\\/?)*/.exec(reqId)[0],\n                  // Some code golf to get the number of \"directories\" back.\n                  back = Math.floor(matching.replace(/\\//g, '').length/1.9 + 0.99),\n                  base;\n              if (back) {\n                base = parts.slice(0, parts.length - back).join('/');\n                if (base) base += '/';\n                reqId = base + reqId.slice(matching.length);\n              }\n              return require(reqId.replace(/\\/$/, ''));\n            }$-- exprts('exports') ? ',' : ');' --$\n:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::\n            $-- exprts('exports') ? 'require,' : 'require);' --$\n///////////////////////////////////////////////////////////////////////////////\n?????????????????????????????????????????????????????????????? exprts('return')\n  ???????????????????????????????????????????????????????? exprts('module')\n            module.exports, module) || module.exports;\n  :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::\n    ????????????????????????????????????????????????? exprts('exports')\n            exports) || exports;\n    ///////////////////////////////////////////////////////////////////\n  /////////////////////////////////////////////////////////////////////////\n:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::\n            $-- exprts('module') ? 'module.exports, module' : 'exports' --$);\n        vaccineModules[id] = $-- exprts('module') ? 'module.exports' : 'exports' --$;\n///////////////////////////////////////////////////////////////////////////////\n      }\n??????????????????????????????????????????????????????????????????????? (debug)\n      var moduleFoundWhere = vaccineModules[id] ? 'local' : 'window';\n      console.log('Returning required ' + moduleFoundWhere + ' module: ' + id);\n///////////////////////////////////////////////////////////////////////////////\n????????????????????????????????????????????????????????????????? (performance)\n      if (firstRequire) {\n        vaccineRequireEnd = Date.now();\n        console.log('Defined in: ' + (vaccineRequireStart - vaccineFirstDefineTime) + ' ms');\n        console.log('Executed in: ' + (vaccineRequireEnd - vaccineRequireStart) + ' ms');\n        console.log('Overall time: ' + (vaccineRequireEnd - vaccineFirstDefineTime) + ' ms');\n      }\n///////////////////////////////////////////////////////////////////////////////\n      return vaccineModules[id] || vaccineWindow[id];\n    }\n\n\n    var vaccineFactories,\n        vaccineModules = {},\n?????????????????????????????????????????????? (numDeps > 1 && supports('amd'))\n        vaccineDependencies = $-- depString --$,\n///////////////////////////////////////////////////////////////////////////////\n        vaccineWindow = window;\n\n??????????????????????????????????????????????????????????????? supports('amd')\n  ?????????????????????????????????????????????????????? supports('window')\n    if (typeof vaccineWindow.define == 'function' &&\n        vaccineWindow.define.amd) {\n  /////////////////////////////////////////////////////////////////////////\n      define('$-- name --$',\n  ????????????????????????????????????????????????????????? (numDeps === 0)\n             function() {\n  ========================================================= (numDeps === 1)\n             $-- depString --$,\n             function(vaccineSingleDep) {\n               vaccineModules.$-- dependencies[0] --$ = vaccineSingleDep;\n  :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::\n             vaccineDependencies,\n             function() {\n               for (var i = 0, args = arguments; i < args.length; ++i) {\n                 vaccineModules[vaccineDependencies[i]] = args[i];\n               }\n  /////////////////////////////////////////////////////////////////////////\n               return require('$-- dirs > 1 ? main : \"./\" + main --$');\n             });\n    $-- supports('window') ? '} else {' : '' --$\n///////////////////////////////////////////////////////////////////////////////\n???????????????????????????????????????????????????????????? supports('window')\n      vaccineWindow.$-- globalName --$ = require('$-- dirs > 1 ? main : \"./\" + main --$');\n    $-- supports('amd') ? '}' : '' --$\n///////////////////////////////////////////////////////////////////////////////\n????????????????????????????????????????????????????????????????????????? (dev)\n    function requireDev(main) {\n      main = main || '$-- main --$';\n      return require($-- dirs > 1 ? 'main' : \"'./' + main\" --$);\n    }\n///////////////////////////////////////////////////////////////////////////////\n","Makefile":".PHONY: build\nbuild:\n\t./build.sh > $-- name --$.js\n","build.sh":"    #!/bin/sh\n    # build with: ./build.sh > $-- name --$.js\n    echo '(function() {$-- useStrict ? '\"use strict\";' : '' --$'\n\n???????????????????????????????????????????????????????????????????? (commonJS)\n    # vaccine.js must NOT be in the source list.\n    source_dir='$-- sourceDir --$'\n\n\n    for file in $(find $source_dir -type f)\n    do\n      name=$(echo \"$file\" | sed -e \"s#^$source_dir/##\" -e 's/\\.js//')\n      echo \"define('$name', function(require, $-- exprts('module') ? 'exports, module' : 'exports' --$) {\"\n      cat $file\n      echo '});'\n    done\n:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::\n    cat $(find $-- sourceDir --$ -type f)   # vaccine.js must NOT be in the source list.\n///////////////////////////////////////////////////////////////////////////////\n\n    cat vaccine.js  # Must be after sources.\n    echo '}());'\n","dev_server.js":"    var sourceDir = '$-- sourceDir --$';   // Change this to... uh, your source directory.\n\n\n    var http = require('http'),\n        fs = require('fs'),\n        exec = require('child_process').exec,\n        port = 3000,\n        rootUrl = 'http://localhost:' + port,\n        server,\n        types;\n\n    types = {\n      js: 'application/javascript',\n      json: 'application/json',\n      html: 'text/html',\n      css: 'text/css',\n\n      png: 'image/png',\n      jpg: 'image/jpeg',\n      jpeg: 'image/jpeg',\n      gif: 'image/gif',\n      ico: 'image/x-icon',\n    };\n\n    server = http.createServer(function (req, res) {\n      findFile(req.url, function(err, fileBufferOrText, path) {\n        if (err) return notFound(err, req.url, res);\n        var ext = path.split('.').pop();\n        if (ext === path) ext = 'html';\n        var type = types[ext];\n        if (!type) type = 'text/plain';\n        if (path.match(new RegExp('^/' + sourceDir + '/'))) {\n          fileBufferOrText = nodeWrap(path, fileBufferOrText);\n        }\n        res.writeHead(200, {'Content-Type': type});\n        res.end(fileBufferOrText);\n      });\n    });\n\n    server.listen(port, 'localhost');\n    console.log('Serving ' + rootUrl);\n    server.on('error', console.log);\n\n    function notFound(err, path, res) {\n      console.log(err);\n      if (!path.match(/favicon\\.ico/)) console.log('404: ' + path);\n      res.writeHead(404, {'Content-Type': 'text/plain'});\n      res.end('404 Not Found\\n');\n    }\n\n    function findFile(path, callback) {\n      fs.stat('.' + path, function(err, stats) {\n        if (err) return callback(err);\n\n        if (stats.isDirectory()) {\n          findFile(path + '/index.html', callback);\n          return;\n        }\n\n        fs.readFile('.' + path, function(err, buffer) {\n          callback(err, buffer, path);\n        });\n      });\n    }\n\n    function nodeWrap(path, buffer) {\n      var prefix = new RegExp('^' + sourceDir + '/'),\n          module = path.slice(1).replace(prefix, '').replace(/\\.js$/, ''),\n          compiled;\n      compiled = 'define(\"' + module + '\", ';\n      compiled += 'function(require, $-- exprts('module') ? 'exports, module' : 'exports' --$) {\\n';\n      compiled += buffer.toString('utf8');\n      compiled += '\\n});';\n      return compiled;\n    }\n"});
});
function define(id, factory) {
  (vaccineFactories = vaccineFactories || {})['./' + id] = factory;
}


function require(id) {
  var module = {exports: {}};

  if (!vaccineLocalModules[id] && !vaccineWindow[id]) {
    vaccineFactories[id](
        require,
        module.exports, module);
    vaccineLocalModules[id] = module.exports;
  }
  return vaccineLocalModules[id] || vaccineWindow[id];
}


var vaccineFactories,
    vaccineLocalModules = {},
    vaccineWindow = window;

  vaccineWindow.vaccine = require('./web');

}());
