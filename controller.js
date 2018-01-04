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
            }); 

res.json({"message": "Create a VSAM file "+_p});
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
	});
res.json({"message": "Delete a VSAM file "+_p});

};


exports.createRecord = function(req, res) {
//create a vsam record (and the vsam file if not yet created). 
var _p = req.params.path;
var _key = req.params.key;
var _name = req.params.name;
var _gender = req.params.gender;
var msg = "message";   
var record = {
              key: _key,
              name: _name,
              gender: _gender
            };
  vsam( _p,
          obj,
          (file, err) => {
            file.write(record, (err) => {
              if (err) {
                  console.log(err);
		msg = "Error occurred. Didn't create a record";
		} else {
		  msg = "Created record:"+record +"in "+_p;            
               };
              console.log(msg);
              expect(file.close()).to.not.throw;
            });
          });

res.json({"message": "Write a record "+ _record + " to VSAM file "+_p});
};


exports.readRecord = function(req, res) {
//read a vsam record
var _p = req.params.path;

   vsam( _p,
         obj,
          (file,err) => {
            assert.ifError(err);

            file.read( (record, err) => {
	      assert.ifError(err);
              if (record == null){
                 console.log("No records found");
              } else {
	         expect(record).to.not.be.null;
	         expect(record).to.have.property('key');
	         expect(record).to.have.property('name');
	         expect(record).to.have.property('gender');
                 console.log("Read " + record + " from " +_p);
              };
	      expect(file.close()).to.not.throw;
            });
          });

res.json({"message": "read a record from VSAM file " +_p});
};


function readUntilEnd(file) {
  var end = false;
  async.whilst(
    // Stop at end of file
    () => { return !end },

    // Read the next record
    (callback) => {
      file.read( (record, err) => {
      console.log(record);
	if (record == null)
          end = true;
	callback(err);
      });
    },

    // Finally close
    (err) => {
      assert.ifError(err);
      expect(file.close()).to.not.throw;
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
            readUntilEnd(file);
          });

res.json({"message": "Read all records in VSAM file "+_p});
};

exports.updateRecord = function(req, res) {
//update a record in a vsam file
var _p = req.params.path;
var _key = req.params.key;
var _name = req.params.name;
var _gender = req.params.gender;

  vsam(_p ,
        obj,
          (file, err) => {
            assert.ifError(err);
            file.find(_key, (record, err) => {
	      assert.ifError(err);
	      record.name = _name;
	      record.gender = _gender;
	      file.update(record, (err) => {
		assert.ifError(err);
		file.find(_key, (record, err) => {
                  assert.ifError(err);
                  assert.equal(record.name, _name, "name has not been updated");
                  assert.equal(record.gender, _gender, "gender has not been updated");
                  expect(file.close()).to.not.throw;
		});
	      });
            });
          });
res.json({"message": "Update record with key " + _key + " in VSAM file " + _p});
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
		   console.log("Could not find record with key "+_key);
	       } else {
                   console.log("Record with key " + _key + " found");
                   file.delete( (err) => {
	  	      assert.ifError(err);
	              file.find(_key, (err) => {
                        assert.ifError(err);
                        expect(file.close()).to.not.throw;
                      });
                    });
                 };
              });
           }); 
res.json({"message": "Delete a record with key " +_key + " from VSAM file " +_p});
};



