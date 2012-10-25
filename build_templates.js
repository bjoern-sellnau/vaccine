#!/usr/bin/env node
var fs = require('fs'),
    vaccine = require('./');

vaccine.loadFiles();

var templateText = vaccine.templateText(),
    templatesJS = 'module.exports = (' + JSON.stringify(templateText) + ');';

fs.writeFileSync(__dirname + '/src/templates.js', templatesJS, 'utf8');
