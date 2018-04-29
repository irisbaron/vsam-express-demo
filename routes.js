module.exports = function(app) {

    var vsam_controller = require('./controller.js');

    // Create a new VSAM file
    app.post('/vsam/:path', vsam_controller.createFile);

    // Delete a VSAM file
    app.delete('/vsam/:path', vsam_controller.deleteFile);

    // Create a new VSAM record
    app.post('/vsam/record/:path&:key&:name&:gender', vsam_controller.createRecord);

    // Read a single VSAM record
    app.get('/vsam/record/:path', vsam_controller.readRecord);

    // Update a VSAM record
    app.put('/vsam/record/:path&:key&:name&:gender', vsam_controller.updateRecord);

    // Delete a VSAM record
   app.delete('/vsam/record/:path&:key', vsam_controller.deleteRecord);

   // Read all VSAM records
     app.get('/vsam/records/:path', vsam_controller.readAllRecords);


}
