var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

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
router.get('/trip', function(req, res) {
    var db = req.db;
    var tripID = req.get("tripID");
    var type = req.get("type");
    var collection;
    if(type === "phone"){
        collection = db.get('phoneRecords');
    }else if(type ==="OBD"){
        collection = db.get('obdRecords');
    }

    collection.find({'hostTrip': tripID},function(e,docs){
        res.json(docs);
    });
});

/*
 * GET a vehicle.
 */
router.get('/vehicle', function(req, res) {
    var db = req.db;
    var collection = db.get('vehicles');
        
    var vehicleID = req.get("vehicleID");

    collection.find({'vehicleID': vehicleID},function(e,docs){
        if (e) {
            res.send("false");
        }
        else {
            res.send("true");
        }
    });
});

/*
 * GET all records.
 */
router.get('/records', function(req, res) {
    var db = req.db;
    var collection = db.get('obdRecords');
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
    // Set our internal DB variable
    var db = req.db;

    // Set our collection
    var tripscollection = db.get('trips');

    tripscollection.update(
        { inProgress: "true" },
        {$set: {
            inProgress: "false",
            endTime: new Date()
        }},
        function(e,docs){
       var trips=docs;
    });
    res.send("");
    
});


/* POST  addOBDRecords*/
router.post('/addOBDRecords', function(req, res) {

    // Set our internal DB variable
    var db = req.db;

    // Set our collection
    var tripscollection = db.get('trips');

    
    tripscollection.find({},{},function(e,docs){
        var trips=docs;
        console.log("hello1");
        var data = req.body.data;
        
        dataJSON=JSON.parse(data);
        console.log(dataJSON);
        for (var i=0; i<dataJSON.records.length;i++) {

             console.log("hello2");
            // Get our form values. These rely on the "name" attributes
            var timeStamp = dataJSON.records[i].timeStamp;
            
            var errors = dataJSON.records[i].errors;

            for (var j=0; j<trips.length;j++){

                var timeStampDate = Date.parse(timeStamp);
                var startTimeDate = Date.parse(trips[j].startTime);
                var endTimeDate = Date.parse(trips[j].endTime);

                if(timeStampDate>startTimeDate && timeStampDate<endTimeDate){   
                    hostTrip=trips[j]._id;
                    var recordCollection = db.get('obdRecords');

                    // Submit to the DB
                    recordCollection.insert({
                        "timeStamp" : timeStamp,
                        "errors" : errors,
                        "hostTrip" : hostTrip
                    });
                }
            }
        }
    });
    res.send("End");
});

/* POST  addPhoneRecords*/
router.post('/addPhoneRecords', function(req, res) {

    // Set our internal DB variable
    var db = req.db;

    // Set our collection
    var tripscollection = db.get('trips');

    tripscollection.find({},{},function(e,docs){
        var trips=docs;
        
        var data = req.body.data;
        data=JSON.parse(data);
        console.log(data.records.length);
        for (var i=0; i<data.records.length;i++) {

             console.log("hello");
            // Get our form values. These rely on the "name" attributes
            var timeStamp = data.records[i].timeStamp;
            var xcoord = data.records[i].xcoord;
            var ycoord = data.records[i].ycoord;
            var speed = data.records[i].speed;

            for (var j=0; j<trips.length;j++){

                var timeStampDate = Date.parse(timeStamp);
                var startTimeDate = Date.parse(trips[j].startTime);
                var endTimeDate = Date.parse(trips[j].endTime);

                if(timeStampDate>startTimeDate && timeStampDate<endTimeDate){   
                    hostTrip=trips[j]._id;
                    var recordCollection = db.get('phoneRecords');

                    // Submit to the DB
                    recordCollection.insert({
                        "xcoord" : xcoord,
                        "ycoord" : ycoord,
                        "speed" : speed,
                        "hostTrip" : hostTrip,
                        "timestamp" : timeStamp
                    });
                }
            }
        }
    });
    res.send("End");
});

module.exports = router;
