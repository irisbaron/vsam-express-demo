module.exports = function(app) {

    var vsam = require('./controller.js');

    // Create a new VSAM file
    app.post('/vsam/:path', vsam.createFile);

    // Delete a VSAM file
    app.delete('/vsam/:path', vsam.deleteFile);

    // Create a new VSAM record
    app.post('/vsam/record/:path&:key&:name&:gender', vsam.createRecord);

    // Read a single VSAM record
    app.get('/vsam/record/:path', vsam.readRecord);

    // Update a VSAM record 
    app.put('/vsam/record/:path&:key&:name&:gender', vsam.updateRecord);

    // Delete a VSAM record
   app.delete('/vsam/record/:path&:key', vsam.deleteRecord);

   // Read all VSAM records
     app.get('/vsam/records/:path', vsam.readAllRecords);


}


