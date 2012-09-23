Vaccine
=======

Vaccine is a temporary treatment
(until [Harmony](http://en.wikipedia.org/wiki/ECMAScript#Features_under_discussion))
to JavaScript's modularity problem that works by injecting a small script into
your code (like how a vaccine uses a virus). It is small enough to be used in
libraries, so that library developers do not have to depend on the application
using it. Vaccine includes support for Node/CommonJS modules.

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
$ echo '}());'
```

Your compiled app now works with vaccine's module syntax. It's that easy!

NPM Install
-----------

You can also install vaccine with `npm`. This creates a binary that lets
you configure vaccine scripts for your app. Calling `vaccine` with
`--app MyAppName` will create a directory called `vaccines` with various
scripts you can use. See `vaccine --help` to get a list of options.

```sh
$ npm install -g vaccine
$ vaccine --app MyAppName --main src/my/app/main/file.js

# Pick out scripts to use
$ cp vaccines/vaccine.js src
$ cp vaccines/build .
$ cp vaccines/vaccine_loader.js .
$ cp vaccines/dev_server_standlone.js .

# Remove vaccines when you're done
$ rm -r vaccines
```

In other places in this README I will make reference to copying a file.
This can be done by `curl`ing github or by creating a `vaccines` folder.
The [root](https://github.com/jakesandlund/vaccine) directory for vaccine
is actually built using the `vaccine` binary.

Define and Require
------------------

If you are familiar with [RequireJS](requirejs.org) or
[Asynchronus Module Definition (AMD)](https://github.com/amdjs/amdjs-api/wiki/AMD),
then you may find it easier to think of vaccine as the alternative
[CommonJS syntax](http://requirejs.org/docs/commonjs.html) with a required
module id.

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
modules use the same name. It is best to prefix your module names with the
name of your app or lib, separated by a slash.

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

Developing With Vaccine
-----------------------

Vaccine supports many different development workflows. Take a look at the
[test/html](https://github.com/jakesandlund/vaccine/tree/master/test/html)
directory for different html files reflecting some of the different ways
to use vaccine.

### With a built file ###

One way to develop with vaccine is to develop with the built file that
includes your sources and vaccine.js. This could be done manually
(which would get annoying) with a separate build step before refreshing a page.
However, vaccine comes with a simple development server
(dev_server_standalone.js) that can build on the fly, so you can just refresh.

The one requirement with the various dev_server_*.js files, is that you must
have a `build` file somewhere that will output (on stdout) the exact text of
your compiled app when called. So you can't have the `build` file save directly
into your file (as shown above). Instead, do this:

```sh
$ ./build > my_app.js
```

### Separate scripts ###

You can still develop with separate script tags for each file. Just make
sure that `vaccine.js` is first in this case.

### Vaccine loader ###

Vaccine comes with a loader version that automatically loads your modules.
Just copy down [vaccine_loader.js](https://github.com/jakesandlund/vaccine/blob/master/vaccine_loader.js)
and edit some of the variables at the top of the file.

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

Node / CommonJS Files
---------------------

If you want to have your modules be CommonJS compliant, there is a slightly
more complicated (but still only ~20 lines of code) way to build your
app/lib.

With this build script, simply leave out the `define` wrapper and use
require, exports, and module as you would in any other CommonJS file. The module
id is determined by your app name and each files path on your file system.
Also make sure that the string passed to `require` does not end in ".js", and
that it would work when you wrap the file in a `define` call.

`dev_server_standalone_node.js` and `dev_server_express_node.js` can be used
to compile your app/lib on the fly. As an added bonus, it will even wrap the
individual files with `define` so that you can use vaccine_loader.js or
separate `script` tags.

Vaccine Variations
------------------

Vaccine comes in different variations. Each one suits a different need.
The full version (but without the loader) is only ~50 lines of code, and
other versions are even less.

### vaccine_minimal.js ###

The minimal vaccine (17 lines of code) is just a global vaccine object with
three methods:

* `get: function(id) ...`: Pass it an id, and it will return the value
  associated with that id.
* `set: function(id, value) ...`: Set's the value associated with the
  given id and calls all `on` functions registered to that id.
* `on: function(id, func) ...`: Add's a callback tied to the id that
  gets called whenever the id's value gets set.

The other vaccine versions keep the minimal vaccine intact while varying
the `define` and `require` functionality to suit different needs.

In AMD, where the app (generally) decides to use AMD, libraries must check if
`define` and `define.amd` are true. With vaccine, if a library decides to
support vaccine, they must at least use the minimal version. They provide
their library with a line of code like so:

```javascript
vaccine.set('my_lib', myLib);
```

If you are using libaries that do not have support for vaccine, you can easily
add support by copying vaccine_minimal.js to the bottom of their lib, and
adding a line like above.

Even easier, the `vaccine` binary has a way to do this with the `--inject`
option:

```sh
$ vaccine -i lib_file.js     # You can also use the --app and --global options.
```

### vaccine_already_ordered.js ###

To save a few bytes and split seconds to the run time, you can use this
version if the modules are defined in order. In order means that every
call to `require` must be to a module that has already been defined.

### vaccine_absolute_require.js ###

This version is vaccine.js but without support for relative requires. To
use this, every module id must be typed out in full when calling `require`.

### vaccine_absolute_require_already_ordered.js ###

This is the combination of the above two versions. You must use full module
ids for `require`, and define everything in order.

### vaccine_(*Your vaccine type here*).js ###

Lastly, vaccine is meant to be simple enough that you can easily make any
changes you want. The two rules are don't break the global `vaccine` api (in
vaccine_minimal.js), and don't add any other global functionality. Other than
that, anything is game.

If you think you have some changes that other people might like, send a
pull request, and I may support it if there is enough interest.

Vaccine Size
------------

Vaccine aims to be as small as possible, so if you see a way to save a
byte, let me know.

If you use the `vaccine` binary, you can figure out how much vaccine will
add to the size of your library app by doing the following:

```sh
$ vaccine --size src        # the location of your source files
```

Running this on [DataZooka](http://www.datazooka.com), a tool I am developing
that uses vaccine, I get the following output:

```sh
$ vaccine --size src
                                   size types:  text  min gzip

                                   vaccine.js:  1534  605  367
                      (integrated) vaccine.js:  1507  579  241

                              already_ordered:  1282  519  323
                 (integrated) already_ordered:  1255  493  200

                             absolute_require:  1086  413  247
                (integrated) absolute_require:  1059  387  146

             absolute_require_already_ordered:   834  327  202
(integrated) absolute_require_already_ordered:   807  301  110

                                      minimal:   515  195  145
                         (integrated) minimal:   515  195   67
```

The *integrated* lines are the ones where it compares the size of your app with
and without vaccine. As you can see, while vaccine is small to begin with, it
gets even smaller when gzipped with your sources, due to the way compression
works.

LICENSE
-------

I'm not sure how to license this. I would say MIT, but that means you need
to copy the license whenever you use vaccine. I don't want you to have to
do that. So maybe just make it public domain?

