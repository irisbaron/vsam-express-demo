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

const vsam = require('vsam.js');
const async = require('async');
const fs = require('fs');
const expect = require('chai').expect;
const assert = require('chai').assert;
const obj  = JSON.parse(fs.readFileSync('test.json'));
const tableify = require('html-tableify');



exports.createRecord = function(req, res) {
//create a vsam record 
var _p = req.params.path;
var _record = {
              key: req.params.key,
              name: req.params.name,
              gender: req.params.gender 
            };
var file;
  try {
       if (vsam.exist(_p))
         file = vsam.openSync( _p,obj);
       else
         file = vsam.allocSync(_p,obj); 
       expect(file).to.not.be.null;

       file.write(_record, (err) => {
          if (!err) {
             res.send("Created record: "+ JSON.stringify(_record) +" in "+_p+"\n");
          } else {
              console.log("Error write record:" + err)
              res.send("Could not create Record" + JSON.stringify(_record)+  " in "+_p + " due to err: "+ err + ". Possibly the key exists already.\n");
       }
       expect(file.close()).to.not.throw;
       });
      } catch (err) {
          console.log("In catch in createRecord: err=" + err + " \n");
	  res.send("Could not create Record" + JSON.stringify(_record)+  " in "+_p + " due to err: "+ err + "\n");
      }
};



exports.updateRecord = function(req, res) {
//update a record in a vsam file
var _p = req.params.path;
var _key = req.params.key;
var _name = req.params.name;
var _gender = req.params.gender;
var rec;
var file;     
  try {

       if (vsam.exist(_p))
         file = vsam.openSync( _p,obj);
       else
         file = vsam.allocSync(_p,obj);      
       expect(file).to.not.be.null;

       file.find(_key, (record, err) => {
          if (record) {
            record.name = _name;
            record.gender = _gender;
            file.update(record, (err) => {
               assert.ifError(err);
               file.find(_key, (rec, err) => {
                  assert.ifError(err);
                  assert.equal(rec.name, _name, "name has not been updated");
                  assert.equal(rec.gender, _gender, "gender has not been updated");
                  res.send("Updated record with key " + JSON.stringify(_key) + " in VSAM file " + _p+"\n");
                  expect(file.close()).to.not.throw;
               });
            }); //update
          } else {
             if (err)
                res.send("Cannot update record with key " + JSON.stringify(_key) + " in VSAM file " + _p+" due to error: "+err+" \n");
             else
                res.send("Cannot update record with key " + JSON.stringify(_key) + " in VSAM file " + _p+" - key not found\n");
             expect(file.close()).to.not.throw;
          }
	});
       } catch (err) {
	   console.log("In catch in updateRecord: err= " + err + " \n");
	   res.send("Could not update record in " +_p +" due to error "+err+ " \n");
       }  
};



exports.readAllRecords = function(req, res) {
//Reads all records from a vsam file
var _p = req.params.path;
var file;
  try {
      	
       if (vsam.exist(_p))
         file = vsam.openSync( _p,obj);
       else
         file = vsam.allocSync(_p,obj);
       expect(file).to.not.be.null;

       expect(file).to.not.be.null;

       readUntilEnd(file,res,_p);
      } catch (err) {
       res.send("Could not open the VSAM file "+_p+" due to error: " + err+ " \n");
       console.log("In catch in readAllRecord: err= " + err + " \n");
       }
};

function readUntilEnd(file,res,vsamfile) {
var end = false;
var _records=[];

  async.whilst(
    // Stop at end of file
    () => { return !end },

    // Read the next record
    (callback) => {
      file.read( (record, err) => {

	 if (record == null)
            end = true;
	 else
            _records.push(record);

	callback(err);
      });
    },  

    // Finally close
    (err) => {
	 assert.ifError(err);
	 expect(file.close()).to.not.throw;

	 if (_records.length<1)
            res.send("No records in vsam "+vsamfile+ "\n" );
	 else
            res.send("Records for vsam "+vsamfile+ ":\n" + tableify(_records)+"\n");
     }  
  );
}

