var express = require('express');
var router = express.Router();
var mongoose= require('mongoose');
var bodyParser = require('body-parser');
var UrlUtility = require('./../Utility/UrlUtility');
var Response = require('./../dto/APIResponse');
var PhraseGroup = require('./../models/PhraseGroup');

var fs = require('fs'),
request = require('request');
/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('Hi I am a Customer Page');
});

var postPhraseGroupRoute = router.route('/addPhraseGroup');
var getAllPhraseGroups = router.route('/getAllPhraseGroups');
var updatePhraseGroup = router.route('/updatePhraseGroup');
var utility = new UrlUtility(
    {
    });
// Connection URL. This is where your mongodb server is running.

var url =utility.getURL();

mongoose.connect(url, function (err, db) {
    if(err)
    {
        console.log("Failed to Connect to MongoDB");
    }
    else {
        console.log("Successfully Connected");
    }
});

updatePhraseGroup.post(function(req, res){
    var phraseGroup = new PhraseGroup();
    var response = new Response();
    var date = new Date();

    PhraseGroup.find({ '_id': req.body._phraseGroupId}, function(err, phraseGroup2) {
        if (!phraseGroup2){
                
            }
        else {
            phraseGroup2[0]._blockId = req.body._blockId;
            phraseGroup = phraseGroup2[0];
            
            phraseGroup.save(function(err) {
            if (err) {
                res.send(err);
            }
            else {
                response.data = phraseGroup;
                response.message = "Success";
                response.code = 200;
                res.json(response);
                console.log('done');
            }
            
            });
        }
    });
});

getAllPhraseGroups.get(function(req, res){
    var response = new Response();
    // Save the beer and check for errors
    
    PhraseGroup.find({}, null, { sort: { '_id': -1 } }, function (err, phraseGroups) {
        if (err)
        {
            res.send(err);
        }
        else
        {
            response.message = "Success";
            response.code = 200;
            response.data = phraseGroups;
            res.json(response);
        }
    });
});

postPhraseGroupRoute.post(function(req, res){
    var phraseGroup = new PhraseGroup();
    var response = new Response();
    var date = new Date();
    phraseGroup.createdOnUTC = date;
    phraseGroup.updatedOnUTC = date;
    phraseGroup.isDeleted = false;
    phraseGroup.save(function(err) {
        if (err) {
            res.send(err);
        }
        else {
            response.data = phraseGroup;
            response.message = "Success";
            response.code = 200;
            res.json(response);
            console.log('done');
        }
    });
});

module.exports = router;