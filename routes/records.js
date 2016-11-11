var express = require('express');
var router = express.Router();

/*
 * GET trips.
 */
router.get('/trips', function(req, res) {
    var db = req.db;
    var collection = db.get('trips');
    collection.find({},{},function(e,docs){
        res.json(docs);
    });
});

/*
 * GET a trip.
 */
router.get('/trips/:trip_id', function(req, res) {
    var db = req.db;
    var collection = db.get('records');
    collection.find({},{},function(e,docs){
        res.json(docs);
    });
});


/* POST start trip */
router.post('/starttrip', function(req, res) {

    // Set our internal DB variable
    var db = req.db;

    // Set our collection
    var tripscollection = db.get('trips');

    var startTime=new Date();

    var vehicleID = "1";

    var inProgress="true"


    //set the end date 1 year from now
    var endTime = new Date(startTime.getTime() + 525600*60000);

    // Submit to the DB
    tripscollection.insert({
        "startTime" : startTime,
        "endTime" : endTime,
        "vehicleID" : vehicleID,
        "inProgress" : inProgress
    }, function (err, doc) {
        if (err) {
            // If it failed, return error
            res.send("There was a problem adding the information to the database.");
        }
        else {
            // And forward to success page
            res.send("");
        }
    });
    
});

/* POST end trip*/
router.post('/endtrip', function(req, res) {
    
    tripscollection.update(
        { inProgress: "true" },
        {
            inProgress: "false",
            endTime: new Date()
        },
        function(e,docs){
       var trips=docs;
    });
    
});

/* POST  addOBDRecords*/
router.post('/addOBDRecords', function(req, res) {

    // Set our internal DB variable
    var db = req.db;

    // Set our collection
    var tripscollection = db.get('trips');

    tripscollection.find({},{},function(e,docs){
       var trips=docs;
    });

    var data = req.body.data;

    data.records.forEach(function(record){
        // Get our form values. These rely on the "name" attributes
        var timeStamp = record.timeStamp;
        var fuelPumpStatus = record.fuelPumpStatus;
        var engineRPM = record.engineRPM;
        var seatBeltStatus = item.seatBeltStatus;
        var absStatus = item.absStatus;
        var hostTrip =  null;

        data.trips.forEach(function(trip){
            if(timeStamp>trip.startTime && timeStamp<trip.endTime){
                hostTrip=trip._id;
            }
        });

        var recordCollection = db.get('trips');

        // Submit to the DB
        recordCollection.insert({
            "timeStamp" : timeStamp,
            "fuelPumpStatus" : fuelPumpStatus,
            "engineRPM" : engineRPM,
            "seatBeltStatus" : seatBeltStatus,
            "absStatus" : absStatus,
            "hostTrip" : hostTrip
        }, function (err, doc) {
            if (err) {
                // If it failed, return error
                res.send("There was a problem adding the information to the database.");
            }
            else {
                // And forward to success page
                res.send("");
            }
        });
    });
});

/* POST  addPhoneecords */
router.post('/addPhoneRecords', function(req, res) {

});

module.exports = router;