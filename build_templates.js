#!/usr/bin/env node
var fs = require('fs'),
    vaccine = require('./');

vaccine.loadFiles();

var templateText = vaccine.templateText();

console.log('module.exports = (' + JSON.stringify(templateText) + ');');
