var fs = require('fs'),
    express = require('express'),
    app = express();

app.use(express.static('public'));

var port = process.env.PORT || 5000;
app.listen(port);
console.log('listening on port ' + port);
