#!/usr/bin/env node
var fs = require('fs'),
    vaccine = require('./');

vaccine.loadTemplates();

var templateText = vaccine.templateText();

console.log('module.exports = (' + JSON.stringify(templateText) + ');');
