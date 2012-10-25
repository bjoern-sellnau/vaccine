var vaccine = require('./vaccine'),
    templateText = require('./templates');

vaccine.templateText(templateText);

exports.configure = function(config) {
  config.targets = ['vaccine.js']
  var configured = vaccine(config);
  document.querySelector('#sources code').innerHTML = configured['vaccine.js'];
};
