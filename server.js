var express = require('express');

// Constants
var PORT = 8888;

// App 
var app = express();
var bodyParser = require('body-parser');
require('./app/routes.js')(app);
var database = require('./app/data.js');

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json())
app.get('/', function(req, res) {
    res.sendFile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
});
app.listen(PORT);
