/* Copyright 2018 IBM Corp. All Rights Reserved.
  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
  
       http://www.apache.org/licenses/LICENSE-2.0
  
   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
'use strict'

// Define required modules
var express = require('express');
var vsam_boot = require('./boot.js');

// Create express app
var app = express();
console.log("Server is up for VSAM application");

// Define a simple route
app.get('/', function(req, res){
    res.json({"message": "Welcome to vsam application."});
});

// Require VSAM routes
require('./routes.js')(app);

// Listen for requests
app.listen(3000, function(){

    console.log("Server is listening on port 3000");

    // Initialize the VSAM dataset 
    vsam_boot.initialize();
});
