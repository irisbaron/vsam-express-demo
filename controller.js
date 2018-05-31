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

exports.createFile = function(req, res) {
//create a vsam file
var _p = req.params.path;
  try {
       var file = vsam.open( _p,obj); 
       expect(file).not.be.null;
       expect(file.close()).to.not.throw;
       res.send("Created a VSAM file "+_p +"\n");
      }  catch (err) {
       console.log("In catch in createFile: err=%s\n",err);
       res.send("Could not open VSAM file "+_p + " due to error: " + err+" \n");
      }


};


exports.deleteFile = function(req, res) {
// Delete a vsam file
var _p = req.params.path;

  try {
       var file = vsam.open( _p,obj);
       expect(file).to.not.be.null;
       expect(file.close()).to.not.throw;

       file.dealloc((err) => {
          assert.ifError(err);
       });
       res.send("Deleted VSAM file "+_p+ "\n");

      } catch (err){
          console.log("In catch in deleteFile: err=%s\n",err);
          res.send("Could not delete VSAM file "+_p + " due to error: " + err+" \n");
      }
};


exports.createRecord = function(req, res) {
//create a vsam record and the vsam file if not yet created
var _p = req.params.path;
var _key = req.params.key;
var _name = req.params.name;
var _gender = req.params.gender;
var msg = "message";
var _record = {
              key: _key,
              name: _name,
              gender: _gender
            };
  try {
       var file = vsam.open( _p,obj);
       expect(file).to.not.be.null;

       file.write(_record, (err) => {
       if (err) {
           console.log("Error write record:" + err)
           res.send("Could not create Record" + JSON.stringify(_record)+  " in "+_p + " due to err: "+ err + "\n");
       }
       else {
         res.send("Created record: "+ JSON.stringify(_record) +" in "+_p+"\n");
       }
       expect(file.close()).to.not.throw;
       });
      } catch (err) {
          console.log("In catch in createRecord: err=%s\n",err);
	  res.send("Could not create Record" + JSON.stringify(_record)+  " in "+_p + " due to err: "+ err + "\n");
      }
};


exports.readRecord = function(req, res) {
//read a vsam record - the first
var _p = req.params.path;
var msg = "message";


  try {
       var file = vsam.open( _p,obj);
       expect(file).to.not.be.null;
       file.read( (record, err) => {
          if (err) {
              msg ="Error reading record: " + err   ; 
          } else if (record == null){
             msg ="No records found in VSAM file " +_p;
          } else {
             expect(record).to.not.be.null;
             expect(record).to.have.property('key');
             expect(record).to.have.property('name');
             expect(record).to.have.property('gender');
             msg = "Read record " + JSON.stringify(record) + " from VSAM file " +_p;
          };
          expect(file.close()).to.not.throw;
          res.send(msg+"\n");
        });
       } catch (err) {
           console.log("In catch in readRecord: err=%s\n",err);
	   res.send("Could not read record from " +_p +" due to error "+err+" \n");
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

exports.deleteRecord = function(req, res) {
// Delete a record from a vsam file
var _p = req.params.path;
var _key = req.params.key;

   try {
        var file = vsam.open( _p,obj);
	file.find(_key, (record, err) => {
          if (record == null) {
             res.send("Could not find a record with key " +JSON.stringify(_key) + " in VSAM file " +_p+"\n");
             expect(file.close()).to.not.throw;
           } else {
             file.delete( (err) => {
	        assert.ifError(err);
                file.find(_key, (rec,err) => {
                   assert.ifError(err);
                   expect(rec).to.be.null;
                   expect(file.close()).to.not.throw;
                   res.send("Deleted a record with key " +JSON.stringify(_key) + " from VSAM file " +_p+"\n");
	        });
             });
           };
	 });
        } catch (err) {
	    console.log("In catch in deleteRecord: err=%s\n",err);
	    res.send("Could not delete record with key " +JSON.stringify(_key) +"from " +_p +" due to error: " + err+ " \n");
        }
};


