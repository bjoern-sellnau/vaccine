Vaccine
=======

Check out Vaccine at [www.vaccinejs.com](http://www.vaccinejs.com)!

The help is also [online](http://www.vaccinejs.com#help-start).

Tool
----

Vaccine will have a command line tool in addition to the
[GUI](http://www.vaccinejs.com).

### Installation ###

With [Node.js](http://nodejs.org/) installed:

```
$ npm install -g vaccine
```

### component.json ###

Vaccine uses `component.json` for some info. This is the same file
used by [Bower](http://twitter.github.com/bower/). Some settings Bower uses
Vaccine does not need, and some settings are Vaccine only.

### Commands ###

Some of these commands can be shortened.

```
$ vaccine component.json
```

Initializes an example component.json.

```
$ vaccine server
```

Starts a development server to serve local files. This is functionally
equivalent to using
[dev_server.js](http://www.vaccinejs.com/#help-dev_server-js).

```
$ vaccine <target-names>   # e.g. $ vaccine vaccine.js build.sh
```

Constructs the targets given.

FAQ
---

### Who is Vaccine for? ###

Vaccine is specifically targeted for JavaScript libraries. It certainly can
be used by applications, but the benefits of the small size are not as
significant.

### Why a new tool for libraries? ###

Currently, libraries are mostly developed as a single large file, or multiple
files that are concatenated in a manually defined order. Few libraries
use a modular format such as CommonJS or AMD, instead using weaker
JavaScript idioms. Vaccine lets libraries use these better
formats and still work in the browser as a script tag.

### What are the CommonJS, AMD, and UMD module formats? ###

See below: [CommonJS](#commonjs), [AMD](#amd), [UMD](#umd).

### What needs do libraries have? ###

Libraries need to provide a single built JavaScript file that can be
dropped in a browser script tag. This is the de facto way of using libraries.
Without support for this, the number of possible users of a library
drastically declines.

Libraries need to be cautious about their size. While there are build tools
that can compile AMD/CommonJS modules into a single file, they are too big
for most libraries.

Libraries need to be in control of, or at the very least understand, the
build process. An opaque build tool makes this more difficult. Libraries
may need to extend the build process. Issues may come up with a build tool
or how they are using it.

Some libraries need to be developed in the browser. Using a single built
file makes it harder for debugging. Splitting out each module into separate
script tags is easier.

### How does Vaccine meet these needs? ###

The Vaccine GUI creates a shim and a tiny build script. In combination they
make a library written in AMD or CommonJS work in a single browser script
tag.

The shim is configured to be as small as possible, so that the tradeoff
between size added and better modularity tips in favor of better modularity.

The tiny build script is easy to comprehend, and easy to modify.

A special version of the shim can be used during development along with
a development server so that testing in the browser is done with each module
as a separate script tag.

### Why is Vaccine a GUI instead of a tool? ###

A build tool will be added at some point for those who prefer that. The GUI
was done initially for the transparency in how Vaccine works. It is easy
to compare configurations to see how the shim is generated. It is also very
quick to use, so the added convenience from a tool will not be that
substantial.

### Why does Vaccine support more than one module format? ###

The JavaScript community is split between different module formats. Some
people prefer one format to another. This way they can choose the format
they like best. Also, CommonJS is needed for libraries that can be used
on the server. AMD is generally considered to be better for the browser.

### Why doesn't Vaccine do package management? ###

Vaccine helps with the development of a JS library and building it into
a single file. It does not come with or tie itself to a specific package
management system. This is purposeful. If Vaccine only worked with a
certain package manager, it would limit the number of possible users of a
library. Therefore, Vaccine is package manager agnostic.

A library can use Vaccine and be distributed in any number of the
available package managers (there are a lot: [Bower](http://twitter.github.com/bower/),
[component](https://github.com/component/component),
[volo](http://volojs.org/), [Jam](http://jamjs.org/),
[npm](https://npmjs.org/)), as well as providing a single built file that
users can grab.

Module Formats
--------------
- [CommonJS](#commonjs)
- [AMD](#amd)
- [UMD](#umd)

CommonJS
--------
See the [CommonJS wiki](http://wiki.commonjs.org/wiki/Modules/1.1) for more
info.

Intro coming soon.

AMD
---
See the [AMD wiki](https://github.com/amdjs/amdjs-api/wiki/AMD) for more
info.

Intro coming soon.

UMD
---
See the [UMD Github](https://github.com/umdjs/umd).

Intro coming soon.


LICENSE
-------

Vaccine is licensed under the MIT license. No, you don't need to have the
license, or even a copyright comment, if you used the files generated by
the GUI or command line tool. Those are public domain.
