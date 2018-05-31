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

module.exports = function(app) {

    // Define required modules  
    var vsam_controller = require('./controller.js');


    // Find a  VSAM record
    app.get('/vsam/record/:path&:key', vsam_controller.findRecord);

    // Update a VSAM record
    app.put('/vsam/record/:path&:key&:name&:gender', vsam_controller.updateRecord);


   // Read all VSAM records
     app.get('/vsam/records/:path', vsam_controller.readAllRecords);


}
