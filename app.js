var fs = require('fs'),
    express = require('express'),
    vaccine = require('./'),
    app = express();

vaccine.loadFiles();

var templateText = vaccine.templateText(),
    templatesJS = 'var templateText = (' + JSON.stringify(templateText) + ');';

fs.writeFileSync(__dirname + '/public/templates.js', templatesJS, 'utf8');


app.use(express.static('public'));

var port = process.env.PORT || 5000;
app.listen(port);
console.log('listening on port ' + port);
