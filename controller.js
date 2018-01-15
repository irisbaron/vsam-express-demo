const tableify = require('html-tableify');
const vsam = require("./node_modules/vsam.js/build/Release/vsam.js.node");
const async = require('async');
const fs = require('fs');
const expect = require('chai').expect;
const assert = require('chai').assert;
const obj  = JSON.parse(fs.readFileSync('node_modules/vsam.js/test/test.json'));

exports.createFile = function(req, res) {
//create a vsam file
var _p = req.params.path;
  vsam( _p,
          obj, 
          (file, err) => {
              expect(file).not.be.null;
      	      expect(err).to.be.null;
	            expect(file.close()).to.not.throw;
              res.send("Create a VSAM file "+_p +"\n");
            }); 

};


exports.deleteFile = function(req, res) {
// Delete a vsam file
var _p = req.params.path;

   vsam( _p,
         obj,
          (file, err) => {
           expect(file).to.not.be.null;
           expect(file.close()).to.not.throw;
      	    file.dealloc((err) => {
      	      assert.ifError(err);
      	    });
            res.send("Delete a VSAM file "+_p+ "\n");
	});

};


exports.createRecord = function(req, res) {
//create a vsam record (and the vsam file if not yet created). 
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
  vsam( _p,
          obj,
          (file, err) => {
            file.write(_record, (err) => {
              if (err) {
		              msg = "Error occurred. Didn't create record  "+JSON.stringify(_record);
		}         else {
		              msg = "Created record: "+ JSON.stringify(_record) +" in "+_p;            
               };
              res.send(msg+"\n");

              expect(file.close()).to.not.throw;
             
            });
          });

};


exports.readRecord = function(req, res) {
//read a vsam record
var _p = req.params.path;
var msg = "message";
   vsam( _p,
         obj,
          (file,err) => {
             assert.ifError(err);

             file.read( (record, err) => {
	              assert.ifError(err);
                if (record == null){
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
          });

};


function readUntilEnd(file,res) {
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
res.send(tableify(_records)+"\n");
    }
  );
}

exports.readAllRecords = function(req, res) {
//Reads all records from a vsam file
var _p = req.params.path;

    vsam( _p,
	  obj,
          (file,err) => {
            assert.ifError(err);
            readUntilEnd(file,res);
          });
};

exports.updateRecord = function(req, res) {
//update a record in a vsam file
var _p = req.params.path;
var _key = req.params.key;
var _name = req.params.name;
var _gender = req.params.gender;
var rec;
  vsam(_p ,
        obj,
          (file, err) => {
            assert.ifError(err);
            file.find(_key, (record, err) => {
	            assert.ifError(err);
              if (record) {
	               record.name = _name;
	               record.gender = _gender;
	               file.update(record, (err) => {
	     	             assert.ifError(err);
		                 file.find(_key, (rec, err) => {
                        assert.ifError(err);
                        assert.equal(record.name, _name, "name has not been updated");
                        assert.equal(record.gender, _gender, "gender has not been updated");
                        res.send("Update record with key " + JSON.stringify(_key) + " in VSAM file " + _p+"\n");
                        expect(file.close()).to.not.throw;
		                  });
	               }); //update
              } else {
                 res.send("Cannot update record with key " + JSON.stringify(_key) + " in VSAM file " + _p+" - key not found\n");
                 expect(file.close()).to.not.throw;
              }
            });
          });
};

exports.deleteRecord = function(req, res) {
// Delete a record from a vsam file 
var _p = req.params.path;
var _key = req.params.key;

      vsam( _p,
        obj,
        (file, err) => {
            assert.ifError(err);
            file.find(_key, (record, err) => {
	             if (record == null) {
                  res.send("Could not find a record with key " +JSON.stringify(_key) + " in VSAM file " +_p+"\n");
                  expect(file.close()).to.not.throw;
	             } else {
                  file.delete( (err) => {
   	  	             assert.ifError(err);
	                   file.find(_key, (err) => {
                        assert.ifError(err);
                        expect(file.close()).to.not.throw;
                        res.send("Delete a record with key " +JSON.stringify(_key) + " from VSAM file " +_p+"\n");
                     });
                  });
               };
            });
        }); 
};



