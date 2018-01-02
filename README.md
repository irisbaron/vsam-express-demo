# Node.js application to interact with VSAM datasets on z/OS

## Overview
In this developer journey we demonstrate how to access and interact with VSAM files from a Node.js application on z/OS. We will use Express framework to create the web server application and build the logic to manipulate VSAM files and records.


## Flow/architecture
The backend Node.js application communicates with VSAM datasets on the z/OS system and provides APIs to query and manage the VSAM file and records.

1.	Create a Node.js web application with Express framework.
2.	Create routes for the web server 
3.  Create controller function and build the logic to interact with VSAM datasets and records on z/OS system 
4.	Test the APIs created.

## Featured technologies
- [Node.js](https://nodejs.org/en/) - An asynchronous event driven JavaScript runtime, designed to build scalable applications
- [Express](https://expressjs.com/) - A popular Node.js web application framework 
- [npm](https://www.npmjs.com/) - package manager for the JavaScript programming language included with Node.js installation

## System Requirements
**Node.js** - Node.js is the server-side JavaScript platform. To install Node.js on z/OS see [IBM SDK for Node.js on z/OS](https://www.ibm.com/us-en/marketplace/sdk-nodejs-compiler-zos). Please note, you can get a free trial version of Node.js on z/OS for testing at [free 90-day trial (SMP/E format)](https://www.ibm.com/us-en/marketplace/sdk-nodejs-compiler-zos/purchase) with installations instructions [here](https://www.ibm.com/support/knowledgecenter/SSTRRS_6.0.0/com.ibm.nodejs.zos.v6.doc/install.htm) or at [Node.js SDK on z/OS trial (pax format)](https://developer.ibm.com/node/sdk/ztp/) (downloads and instructions). Please follow the installation instructions provided, in particular for the pax format trial version. Make sure you install the C/C++ compiler, as described in the documentation, as it is needed for this exercise.

Verify installation with:
```bash
node --version
```
**Git** - Git is a distributed version control system. You can get [git for z/OS from Rocket Software.](http://www.rocketsoftware.com/zos-open-source/tools).

**cURL** - cURL is command line tool for transfer data in different protocols. To run it on z/OS, you can get [cURL for z/OS from Rocket Software.](http://www.rocketsoftware.com/zos-open-source/tools).

**VSAM** - Virtual Storage Access Method (VSAM) is a file storage access method used in MVS, ZOS and OS/390 operating systems. Please make sure you have privileges to create and access VSAM datasets.

## Application Walkthrough 
In this section, we provide step-by-step instructions to create and run a Node.js application that interacts with VSAM datasets on z/OS. In our example, we use Key Sequence Data Set (KSDS) VSAM data set. The application allows you to create and delete VSAM files, and then manipulate VSAM records via CRUD functionality to create, read, delete and update records.
The section is divided into two parts, corresponding to two levels of experience: Part A guides you through the steps to deploy the Node.js vsam application on z/OS, run it and test it. By the end of the part you will have a running application that provides basic capabilities to fully interact with VSAM datasets.
Part B guides you through the steps to create your own Node.js application that communicates with VSAM datasets. By the end of this part you will have the basic understanding of Express framework and the knowledge to access and manipulate VSAM datasets from Node.js application using the vsam.js npm.   


## Part A: Steps to Deploy VSAM application and test
This part guides you through the steps to clone the git repository and deploy the Node.js vsam application on z/OS, run the application and test it.

### Clone the Repository
To clone the repository on z/OS run the following: 
```bash
git clone git://github.com/irisbaron/vsam-express-demo
```
Alternatively, download the developer journey code as a zip file from [here](https://github.com/irisbaron/vsam-express-demo/archive/master.zip). On z/OS, use 'unzip -a' to unzip.

### Run the Application
In the developer journey code directory, follow the code below to install the Node.js module dependencies using npm, and run the application.
```bash
cd vsam-express-demo    
npm install
node server.js
```

The output will be:
```bash
Server is up for VSAM application
Server is listening on port 3000
```

### Test the Application
Use the cURL command from the command-line in a separate shell/terminal, ether locally or remotely. 
Make sure to replace the dataset name, USER.TEST.VSAM.KSDS2, with a customized one that matches your environment.
In case you run remotely, change specify the hostname instead of localhost.

Create VSAM file:
```bash
curl -X POST “http://localhost:3000/vsam/USER.TEST.VSAM.KSDS2”
```

Create a VSAM record
```bash
curl -X POST "http://localhost:3000/vsam/record/USER.TEST.VSAM.KSDS2&0123&James&MALE”
```

Read a VSAM record
```bash
curl -X GET "http://localhost:3000/vsam/record/USER.TEST.VSAM.KSDS2”
```

Read all VSAM records
```bash
curl -X GET "localhost:3000/vsam/records/USER.TEST.VSAM.KSDS2"
```

Update a VSAM record
```bash
curl -X PUT "http://localhost:3000/vsam/record/USER.TEST.VSAM.KSDS2&0123&IRIS&FEMALE"
```

Delete a vsam record
```bash
curl -X DELETE "http://localhost:3000/vsam/record/USER.TEST.VSAM.KSDS2&0123"
```

Delete Vsam file
```bash
curl -X DELETE "http://localhost:3000/vsam/USER.TEST.VSAM.KSDS2"
```


## Part B: Steps to Create the VSAM application
This part guides you through the following steps to create your own vsam application on z/OS: 
1.	[Create an Express Project](#create-an-express-project)
2.	[Set up a Web Server](#set-up-a-web-server)
3.	[Define Routes](#define-routes)
4.	[Write the Controller Functions](#write-the-controller-functions)
5.	[Add Application Logic](#add-application-logic)
6.	[Test your applicaiton](#test-your-application)

### Create an Express Project
We start by creating a Node.js empty project:
```bash
mkdir vsam-express-demo
cd vsam-express-demo
npm init
```
The ‘npm init’ will create and populate the package.json with the definition for the project. Press Enter to confirm the questions. Next we create dependencies using npm. 
Next we install the dependencies for our project, including Express and VSAM.js. 

```bash
npm install express vsam.js chai async --save
```
As a result, node_modules directory will be populated with the required dependencies, e.g. the vsam.js directory is created and populated.

### Set up a Web Server
In the root folder, the vsam-express-demo, create a new file, server.js, and populate it with the information below. 
This will be the main entry point of our application.

```javaScript
var express = require('express');

// create express app
var app = express();
console.log("Server is up for VSAM application");

// define a simple route
app.get('/', function(req, res){
    res.json({"message": "Welcome to VSAM application."});
});

// listen for requests
app.listen(3000, function(){
    console.log("Server is listening on port 3000");
});
```

The code, starts an express application, which is a web server framework. We then defined a GET route which returns a welcome message, and lastly, set up the server to listen to port 3000. 

### Define Routes
We now create the routes for the VSAM application, that is the URL handling code.
In the root folder, create a new file called routes.js with the following contents:

```javaScript
module.exports = function(app) {

    var notes = require('controller.js');

    // Create a new VSAM file
    app.post('/vsam/:path', vsam.createFile);

    // Delete a VSAM file
    app.delete('/vsam/:path', vsam.deleteFile);

    // Create a new VSAM record
    app.post('/vsam/record/:path&:key&:name&:gender', vsam.createRecord);

    // Read a single VSAM record
    app.get('/vsam/record/:path', vsam.readRecord);

    // Read all VSAM records
    app.get('/vsam/records/:path', vsam.readAllRecords);

    // Update a VSAM record
    app.put('/vsam/record/:path&:key&:name&:gender', vsam.updateRecord);

    // Delete a VSAM record
    app.delete('/vsam/record/:path&:key', vsam.deleteRecord);

}
```

This declares the handler functions for all the resource endpoints we need for our application. For each route, it specifies the HTTP form (GET, POST, PUT and DELETE) and the method handler. 
The code contains a require statement for controller.js file, which we define the next section. 

In order to use the routes in the application, we need to include the routes.js file in server.js. 
For this open the server.js file and add the following require statement before app.listen() line.

```javaScript
// ........

// Require VSAM routes
require('routes.js')(app);  

// ........
```

### Write the Controller functions
The controller will contain methods for handling all the CRUD operations for our application. 

In the root directory, create a new file called controller.js with the following contents:

```javaScript
const vsam = require("node_modules/vsam.js/build/Release/vsam.js.node");
const async = require('async');
const fs = require('fs');
const expect = require('chai').expect;
const assert = require('chai').assert;
const obj = JSON.parse(fs.readFileSync('node_modules/vsam.js/test/test.json'));

exports.createFile = function(req, res) {
//create a vsam file
};

exports.deleteFile = function(req, res) {
    // Delete a vsam file
};

exports.createRecord = function(req, res) {
//create a vsam record (and the vsam file if not yet created.
};

exports.readRecord = function(req, res) {
//read a vsam record
};

exports.readAllRecords = function(req, res) {
    // reads all records from a vsam file
};

exports.updateRecord = function(req, res) {
//update a record in a vsam file
};

exports.deleteRecord = function(req, res) {
    // delete a record from a vsam file
};
```

In our example we used the `node_modules/vsam.js/test/test.json` file definition, to specify the record object configuration. 
We are now ready to add the logic.

### Add Application Logic
[controller.md](https://github.com/irisbaron/vsam-express-demo/blob/master/controller.md) contains the implementation snippets of each of the specified controller functions. You can manually copy them one by one, or alternatively clone or download the github code, and copy over the controller.js file.

### Test your Application
Run the application 
```bash
node server.js
```
And follow the steps in section [Test the Application](#test-the-application).
