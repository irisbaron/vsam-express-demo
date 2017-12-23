var express = require('express');


// create express app
var app = express();
console.log("Server is up for VSAM application");


// define a simple route
app.get('/', function(req, res){
    res.json({"message": "Welcome to vsam application."});
});

// Require Notes routes
require('./routes.js')(app);

// listen for requests
app.listen(3000, function(){
    console.log("Server is listening on port 3000");
});
