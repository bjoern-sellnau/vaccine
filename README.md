Vaccine
=======

Vaccine is a temporary treatment
(until [Harmony](http://en.wikipedia.org/wiki/ECMAScript#Features_under_discussion))
to JavaScript's modularity problem that works by injecting a small script into
your code (like how a vaccine uses a virus). It is small enough to be used in
libraries, so that library developers do not have to depend on the application
using it. Vaccine includes support for Node/CommonJS modules. It also handles
library-to-library or application-to-library "requires".

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
this (or use the provided
[build script](https://github.com/jakesandlund/vaccine/blob/master/build)):

```sh
$ file=my_app.js          # Whatever you want your compiled file to be called
$ echo '(function() {' > $file
$ cat src/* > $file       # Concatenate all source files and vaccine.js
$ echo '}());' > $file
```

Your compiled app now works with vaccine's module syntax. It's that easy!

NPM Install
-----------

You can also install vaccine with `npm`. This creates a binary that lets
you configure vaccine scripts for your app. Calling `vaccine configure
my_app_name` will create a directory called `vaccines` with various scripts you
can use. See `vaccine --help` to get a list of options.

```sh
# Install the vaccine binary
$ npm install -g vaccine

# Configure vaccine for your app (--src defaults to src/, --lib to lib)
$ vaccine configure my_app_name --src path/to/my/sources --lib libraries

# Pick out scripts to use
$ cp vaccines/vaccine.js path/to/my/sources
$ cp vaccines/build .
$ cp vaccines/vaccine_loader.js .
$ cp vaccines/dev_server_standlone.js .

# Remove vaccines when you're done
$ rm -r vaccines
```

In other places in this README I will make reference to copying a file.
This can be done by `curl`ing github or by creating a `vaccines` folder with
the binary. The [root](https://github.com/jakesandlund/vaccine) directory for
vaccine is actually built using the `vaccine` binary.

Define and Require
------------------

To make a module, simply wrap your module in a call to `define` with the
module's name, and a function that accepts three arguments (require, exports,
module):

* `require`: Used to require other modules. A call to require with a
  module's string id will return that module's api object.
* `exports`: Attach properties to this object, and they will be available as
  part of the module's public api. This object gets returned when this module
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

The module name/id given to `define` is the full name, so be careful that no two
modules use the same name. It is important to **prefix your module names** with
the name of your app or lib, separated by a slash (e. g.
`define('my_app/module', ...` instead of `define('module', ...`).

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

### Index modules ###

If you define a module that ends in `/index`, then it will also set the
module without that suffix to the same object. It is best practice to require
the id *without* the `/index`, but define the module *with* it. The advantage
of doing it this way is that you can use a relative require within the
index module, and it will work as expected.

```javascript
// define with '/index'
define('my_lib/util/index', function(require, exports, module) {
  var logger = require('./logger'),
      mailer = require('./mailer'),

  module.exports = {
    logger: logger,
    mailer: mailer,
  };
});

define('my_lib/index', function(require, exports, module) {
  var util = require('./util');  // require without '/index'

  util.logger.log('Cool this works...');
  ...
});

// my_lib can now be required with: require('my_lib');
```

### Things to know ###

* The `define`'s can be in any order (for the full version of vaccine.js).
* The module id's passed to `define` are global, so make sure that there
  are no collisions by using your app/lib name as a prefix.
* Don't use `.js` at the end of module ids.
* Circular dependencies are not supported. However, as long as you let the
  module's function return, you can call require at some later point to get
  a module's exports.
* The `require` currently works by using exceptions (try, catch, throw). This
  means that you should not have any side effects before a `require` call
  for a module that isn't yet defined. This shouldn't be a problem,
  as it is common practice to keep requires at the top of a module anyway.

Developing With Vaccine
-----------------------

Vaccine supports many different development workflows. Take a look at the
[test/html](https://github.com/jakesandlund/vaccine/tree/master/test/html)
directory for different html files reflecting some of the different ways
to use vaccine.

### With a built file ###

One workflow is to develop with the built file that
includes your sources and vaccine.js. This could be done manually
(which would get annoying) with a separate build step before refreshing a page.
However, vaccine comes with development servers (`dev_server_*.js`) that can
build on the fly, so you can just refresh.

### Separate scripts ###

You can still develop with separate script tags for each file. Just make
sure that `vaccine.js` is first in this case.

### Vaccine loader ###

Vaccine comes with a loader version that automatically loads your modules.
Just copy down [vaccine_loader.js](https://github.com/jakesandlund/vaccine/blob/master/vaccine_loader.js)
and edit some of the variables at the top of the file. Or you can use the
`vaccine` binary, described above.

```sh
$ curl -O https://raw.github.com/jakesandlund/vaccine/master/vaccine_loader.js
$ vim vaccine_loader.js   # Or whatever your favorite editor is.
```

Then use it in your html files like this:

```html
<script src="/vaccine_loader.js"></script>

<!-- If you have scripts that depend on your app, add a short
     script below vaccine_loader. Like so: -->
<script>vaccine_load("/full/path/to/script.js");</script>
```

Things to know:

* This loader is for development purposes only! When you go to combine your
  files, make sure you are not using vaccine_loader.js.
* The loader is meant to be used with any of the development servers (described
  below). It will not work with `python -m SimpleHTTPServer` or equivalent.
  This is because when you `require('my_app/pkg')`, it will make a request
  for `source_dir/pkg.js`, even if the file is actually
  `source_dir/pkg/index.js`. The dev servers sort this out.

Development Servers
-------------------

Vaccine comes with a few choices for development servers to serve
your scripts and static files. These have a number of capabilities:

* Serve static files, including pre-built JavaScript sources, and `index.html`
  for directories.
* Serve a built-on-the-fly version of your compiled app/lib.
* Work with vaccine_loader.js to find the "/index" versions of modules.
* For the "_node" versions, wrap the node modules in `define` calls.

If you want to use the [express](http://expressjs.com/) versions, you must
first install express:

```sh
$ npm install express
```

Run the servers with Node.js:

```sh
$ node dev_server_standalone.js
```

For the build-on-the-fly functionality, put `script` tags in your html
with the name/path of an executable that will output (on stdout) the exact text
of your compiled app when called.

```html
<script src="/build_your_app"></script>
```

You can't have the build script save directly into your file (as shown at the
beginning of this README). Instead, do this when you want to compile your
file:

```sh
$ ./build > my_app.js
```

The build script must have "build" as the prefix to the path/name.
Any of these will work:

* build
* build_my_app.sh
* build/with/uglifyjs
* build_scripts/production

Node / CommonJS Files
---------------------

If you want to have your modules be CommonJS compliant, there is a slightly
more complicated (but still only ~13 lines of code) way to
[build](https://github.com/jakesandlund/vaccine/blob/master/build_node) your
app/lib.

With this build script, simply leave out the `define` wrapper and use
require, exports, and module as you would in any other CommonJS file. The module
id is determined by each file's path on your file system, prefixed by your
app name. Also make sure that the string passed to `require` does not end in
".js", and that it would work when you wrap the file in a `define` call.

`dev_server_standalone_node.js` and `dev_server_express_node.js` can be used
to compile your app/lib on the fly. As an added bonus, it will even wrap the
individual files with `define` so that you can use vaccine_loader.js or
separate `script` tags.

Vaccine Variations
------------------

Vaccine comes in different variations. Each one suits a different need.
The full version (but without the loader) is only ~40 lines of code, and
other versions are even less.

### vaccine_minimal.js ###

The minimal vaccine is just a global vaccine object with
three properties:

```javascript
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
// Set your library with vaccine.s('mylib', mylib);
```

The other vaccine versions keep the minimal vaccine intact while varying
the `define` and `require` functionality to suit different needs.

In AMD, where the app (generally) decides to use AMD, libraries must check if
`define` and `define.amd` are true. With vaccine, if a library decides to
support vaccine, they must at least use the minimal version. They provide
their library with a line of code like so:

```javascript
vaccine.s('my_lib', myLib);
```

If you are using libaries that do not have support for vaccine, you can easily
add support by copying vaccine_minimal.js to the bottom of their lib, and
adding a line like above.

Even easier, the `vaccine` binary has a way to do this with the `inject`
command:

```sh
$ vaccine inject lib_file.js   # You can also use the --app and --global options.
```

### vaccine_ordered.js ###

To save a few bytes and split seconds to the run time, you can use this
version if the modules are defined in order. In order means that every
call to `require` must be to a module that has already been defined.

### vaccine_simple.js ###

This version is vaccine_ordered.js with limited support for relative requires and
without the "/index" hook.

The only relative require that works is `./module` to `my_app/module`. In fact,
it just replaces the `.` with your app name. This is even the case for
the `my_app` module, which is different than how the full relative require
version works.

While defining "my_app/index" does not also define "my_app", this is not needed
due to how the `.` is replaced with your app name. So this works (but only
with the limited relative require):

```javascript
define('my_app', function(require, exports, module) {

  // Require 'my_app/module' using limited relative require. If you
  // later switch to full relative requires, you must change this module
  // to 'my_app/index', or else this would require 'module' not 'my_app/module'.
  var module = require('./module');
  ...
});
```

If you are using CommonJS modules, then use vaccine_simple.js with
`build_node_simple`, as this renames `my_app/index` to `my_app`.

### vaccine_(*Your vaccine type here*).js ###

Lastly, vaccine is meant to be simple enough that you can easily make any
changes you want. The two rules are:  don't break the global `vaccine` api (in
vaccine_minimal.js), and don't add any other global functionality. Other than
that, anything is game.

If you think you have some changes that other people might like, send a
pull request, and I might support it if there is enough interest.

Vaccine Size
------------

Vaccine aims to be as small as possible, so if you see a way to save a
byte, let me know.

If you use the `vaccine` binary, you can figure out how much vaccine will
add to the size of your library/app by running the line below. Your modules
need to be in vaccine `define` format for accurate size measurements
(besides minimal, which doesn't have that requirement).

```sh
$ vaccine size src [--app my_app ...]   # src is the location of your source files
```

Running this on [DataZooka](http://www.datazooka.com), a tool I am developing
that uses vaccine, I get the following output: (the size is ~12k gzipped)

```sh
$ vaccine size src --app datazooka
                 size types:  text  min   gz   gz-%

                 vaccine.js:  1760  591  363      -
    (integrated) vaccine.js:  1760  580  259  2.19%

                    ordered:  1455  482  310      -
       (integrated) ordered:  1455  476  201  1.70%

                     simple:   944  255  188      -
        (integrated) simple:   944  249  102  0.86%

                    minimal:   609  116  109      -
       (integrated) minimal:   583  143   55  0.47%
```

The *integrated* lines are the ones where it compares the size of your app with
and without vaccine. While vaccine is small to begin with, it
gets even smaller when gzipped with your sources, due to the way compression
works.

The reason "integrated" minimal is larger for the minified sizes
is because it uses `vaccine inject app.js` which (effectively) adds a line
like `vaccine.set('my_app', my_app_global);`.

Note that the gz-% column shows the percentage increase of your gzipped
app when adding vaccine. The percentage of bytes that make up vaccine
in the gzipped app would be slightly smaller, depending on the initial
size of your app.

Conversion Tool
---------------

Vaccine comes with a conversion tool (`vaccine convert`) to help you convert
your code base to vaccine format, or between absolute and relative requires.

**This tool is destructive. Back up your code.**

**This tool is a work in progress.**

LICENSE
-------

I'm not sure how to license this. I would say MIT, but that means you need
to copy the license whenever you use vaccine. I don't want you to have to
do that. So maybe just make it public domain?
