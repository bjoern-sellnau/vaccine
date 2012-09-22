Vaccine
=======

Vaccine is a temporary treatment
(until [Harmony](http://en.wikipedia.org/wiki/ECMAScript#Features_under_discussion))
to get modular JavaScript that works by injecting a small script into your code
(like how a vaccine uses a virus). It is small enough to be used in libraries,
so that library developers do not have to depend on the application using
vaccine.

Simple Install
--------------

The simplest installation is to copy `vaccine.js` into your project and
concatenate all your source files with it to make your single app/lib file.
Let's say you have all your source files (and only source files) under `src/`.
Then from your project's root directory:

```sh
$ curl https://raw.github.com/jakesandlund/vaccine/master/vaccine.js > src/vaccine.js
```

Now to build your app's (or lib's) compiled javascript file, do something like
this:

```sh
$ file=my_app.js          # Whatever you want your compiled file to be called
$ echo '(function() {' > $file
$ cat src/* > $file       # Concatenate all source files and vaccine.js
$ echo '}());'
```

Your compiled app now works with vaccine's module syntax. It's that easy!
There are other ways to "install" vaccine desribed further below if you
want more functionality/flexibility.

Define and Require
------------------

If you are familiar with [RequireJS](requirejs.org) or
[Asynchronus Module Definition (AMD)](https://github.com/amdjs/amdjs-api/wiki/AMD),
then you may find it easier to think of vaccine as the alternative
[CommonJS syntax](http://requirejs.org/docs/commonjs.html) with a required
module id.

To make a module, simply wrap your module in a call to define with the
module's name, and a function that accepts three arguments (require, exports,
module):

* `require`: Used to require other modules. A call to require with a
  module's string id will return that module's api object.
* `exports`: Attach properties to this object, and they will be available as
  part of the module's public api. This object get returns when this module
  is required (unless `module.exports` is overwritten).
* `module`: Set `module.exports` to control exactly what gets returned from
  the `require` call.

```javascript
define('util', function(require, exports, module) {
  exports.say = function(message) {
    console.log('You say: ' + message);
  };
});

define('message', function(require, exports, module) {
  var util = require('util');
  module.exports = function() {
    util.say('Hey, this is neat!');
  };
});

define('runner', function(require, exports, module) {
  var message = require('message');
  message();  // Outputs: "You say: Hey, this is neat!"
});
```

The module name/id given to define is the full name, so be careful that no two
modules use the same name. It is best to use a name for you app/library and
have that be the first part of all modules, separated by a slash.

### Relative require ###

`require` can accept relative module "paths" to compute the module id based
off of the current module being defined.

```javascript
define('my_app/math/add', function(require, exports, module) {
  module.exports = function(x, y) {
    return x + y;
  };
});

define('my_app/math/double', function(require, exports, module) {
  var add = require('./add');
  module.exports = function(x) {
    return add(x, x);
  };
});

define('my_app/examples/fun', function(require, exports, module) {
  var double = require('../math/double');

  // Outputs "Aren't pointless examples 2 times more fun?"
  console.log("Aren't pointless examples " + double(1) + " times more fun?");
});
```

### Things to know ###

* The `define`'s can be in any order.
* Circular dependencies are not supported. However, as long as you let the
  module's function return, you can call require at some later point to get
  it.

Minimal Vaccine
---------------

Vaccine is extremely simple. The full version is ~50 lines, with other
versions that are even fewer.

The minimal vaccine (17 lines of code) is just a global vaccine object with
three methods:

* `get: function(id) ...`: Pass it an id, and it will return the value
  associated with that id.
* `set: function(id, value) ...`: Set's the value associated with the
  given id and calls all `on` functions registered to that id.
* `on: function(id, func) ...`: Add's a callback tied to the id that
  gets called whenever the id's value get's set.

The other vaccine versions keep the minimal vaccine intact while varying
the `define` and `require` functionality to suit different needs.

In AMD, where the app (generally) decides to use AMD, libraries must check if
`define` and `define.amd` are true. With vaccine, if a library decides to
support vaccine, they must at least use the minimal version.

