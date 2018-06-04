const vsam = require('vsam.js');
const fs = require('fs');
const expect = require('chai').expect;
const assert = require('chai').assert;
const obj  = JSON.parse(fs.readFileSync('test.json'));

var _p="IBMUSER.TEST.VSAM.KSDS"

exports.initialize  = function() {

   if (vsam.exist(_p)){
       var file = vsam.openSync( _p,obj);
       expect(file).to.not.be.null;
       expect(file.close()).to.not.throw;

       file.dealloc((err) => {
          assert.ifError(err);
          populateVSAM();
       });
   } else{
     populateVSAM();
   }

}


function populateVSAM(){
   var record1 = {key: 1,name: "Mike",gender: "Male"};
   var record2 = {key: 2,name: "Eric",gender: "Male"};
   var record3 = {key: 3,name: "Daphne",gender: "Female"};
   var record4 = {key: 4,name: "Ethan",gender: "Male"};
   var record5 = {key: 5,name: "Iris",gender: "Female"};
   try{
      var file = vsam.allocSync( _p,obj);
      expect(file).to.not.be.null;

      file.write(record1, (err1) => {
       if (!err1) {
           console.log("Created record: "+ JSON.stringify(record1) +" in "+_p);
           file.write(record2, (err2) => {
              if (!err2) {
                  console.log("Created record: "+ JSON.stringify(record2) +" in "+_p);
                  file.write(record3, (err3) => {
	            if (!err3) {
                       console.log("Created record: "+ JSON.stringify(record3) +" in "+_p);
                       file.write(record4, (err4) => {
		       if (!err4) {
      	      	           console.log("Created record: "+ JSON.stringify(record4) +" in "+_p);
      	                   file.write(record5, (err5) => {
                               if (!err5) {
      	      	                    console.log("Created record: "+ JSON.stringify(record5) +" in "+_p);
		      	            expect(file.close()).to.not.throw;
      	      	               } else errWrite(err5);
                       })
                       } else errWrite(err4);
                    })	
                   } else errWrite(err3); 
                 })
              } else errWrite(err2);

           }) 
       } else errWrite(err1);
      })

   } catch (err) {
       console.log("In catch in populateVSAM: err=%s\n",err);
       return;
   }
}

function errWrite(err){
console.log("Could not populate dataset "+_p + " due to err: "+ err + "\n");
expect(file.close()).to.not.throw;
//return;
}

