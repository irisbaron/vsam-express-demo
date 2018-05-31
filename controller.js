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

exports.findRecord = function(req, res) {
//update a record in a vsam file
var _p = req.params.path;
var _key = req.params.key;
var rec;

  try {
       var file = vsam.open( _p,obj);
       expect(file).to.not.be.null;

       file.find(_key, (record, err) => {
          if (record) {
            res.send("Found record with key " + JSON.stringify(_key) + " in VSAM file " + _p+": " +  JSON.stringify(record) +" \n");
          } else {
	     if (err)
		res.send("Cannot find record with key " + JSON.stringify(_key) + " in VSAM file " + _p+" due to error: "+err+" \n");
	     else
		res.send("Cannot find record with key " + JSON.stringify(_key) + " in VSAM file " + _p+" - key not found\n");
          }
          expect(file.close()).to.not.throw;
	});
       } catch (err) {
           console.log("In catch in updateRecord: error: " +err+" \n");
           res.send("Could not update record in " +_p +" due to error "+err+ " \n");
       }
};


exports.updateRecord = function(req, res) {
//update a record in a vsam file
var _p = req.params.path;
var _key = req.params.key;
var _name = req.params.name;
var _gender = req.params.gender;
var rec;
     
  try {
       var file = vsam.open( _p,obj);
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
	   console.log("In catch in updateRecord: err=%s\n",err);
	   res.send("Could not update record in " +_p +" due to error "+err+ " \n");
       }  
};



exports.readAllRecords = function(req, res) {
//Reads all records from a vsam file
var _p = req.params.path;

  try {
       var file = vsam.open( _p,obj);
       expect(file).to.not.be.null;

       readUntilEnd(file,res,_p);
      } catch (err) {
       res.send("Could not open the VSAM file "+_p+" due to error: " + err+ " \n");
       console.log("In catch in readAllRecord: err=%s\n",err);
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
      try {
	 assert.ifError(err);
	 expect(file.close()).to.not.throw;

	 if (_records.length<1)
            res.send("No records in vsam "+vsamfile+ "\n" );
	 else
            res.send("Records for vsam "+vsamfile+ ":\n" + tableify(_records)+"\n");

       } catch (err) {
	 console.log("In catch in readUntilEnd: err=%s\n",err);
	 res.send("Could not read all records from " +_p +" due to error: " + err+ " \n");
       }
     }  
  );
}

