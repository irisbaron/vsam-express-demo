const vsam = require('vsam.js');
const fs = require('fs');
const async = require('async');
const obj  = JSON.parse(fs.readFileSync('test.json'));

var _p = "IBMUSER.TEST.VSAM.KSDS"

exports.initialize  = function() {

   if (vsam.exist(_p)){
       var file = vsam.openSync( _p, obj);
       file.close();

       file.dealloc((err) => {
          if (err)
            throw err;
          populateVSAM();
       });
   } else{
     populateVSAM();
   }

}


function populateVSAM(){
    var records = [
      {key: 1, name: "Mike", gender: "Male"},
      {key: 2, name: "Eric", gender: "Male"},
      {key: 3, name: "Daphne", gender: "Female"},
      {key: 4, name: "Ethan", gender: "Male"},
      {key: 5, name: "Iris", gender: "Female"}
    ];
    try {
      var file = vsam.allocSync( _p,obj);
      async.eachSeries(records, function(record, callback) {
        file.write(record, callback);
        console.log("Created record: " + JSON.stringify(record) + " in " + _p);
      }, function(err) {
        if (err)
          console.log("Could not populate dataset " + _p + " due to err: " + err + "\n");
      });

    } catch (err) {
       console.log("In catch in populateVSAM: err=%s\n",err);
       return;
    }
}
