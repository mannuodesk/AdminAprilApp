var express = require('express');
var router = express.Router();
var mongoose= require('mongoose');
var Phrases = require('./../models/Phrases');
var UrlUtility = require('./../Utility/UrlUtility');
var Response = require('./../dto/APIResponse');
var PhraseGroup = require('./../models/PhraseGroup');
var Block = require('./../models/Block');

 //GET home page. 
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

var postPhrasesRoute = router.route('/addPhrase');
var getAllPhrasesRoute = router.route('/getAllphrases');
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

postPhrasesRoute.post(function(req, res) {
    // Create a new instance of the Beer model
    var phrases = new Phrases();
    var response = new Response();
    var date = new Date();
    // Set the beer properties that came from the POST data
    var phrase = req.body.phraseText;
    phrases.phraseText = phrase.toLowerCase();
    phrases.phrase = req.body.phraseText;
    phrases._phraseGroupId = req.body._phraseGroupId;
    phrases.createdOnUTC = date;
    phrases.updatedOnUTC = date;
    phrases.isDeleted = false; 
    console.log(phrases);
    // Save the beer and check for errors
    phrases.save(function(err) {
        if (err) {
            res.send(err);
        }
        else {
            response.data = phrases;
            response.message = "Success";
            response.code = 200;
            res.json(response);
            console.log('done');
        }
    });
});

getAllPhrasesRoute.get(function (req, res) {
    // Create a new instance of the Beer model
    var response = new Response();
    var groupsArray = [];
    var array = [];
    var groupsBlockDto = {
        'phraseGroup':PhraseGroup,
        'phrases':[],
        'block':Block
    };       
    PhraseGroup.find({}, null, { sort: { 'order': -1 } }, function (err, PhraseGroups) {
        if (err)
        {
            res.send(err);
        }
        else
        {
            for(var i = 0; i< PhraseGroups.length; i++)
            {
                groupsBlockDto = {
                    'phraseGroup':PhraseGroup,
                    'phrases':[],
                    'block':Block
                };     
                groupsBlockDto.phraseGroup = PhraseGroups[i];
                var phraseGroupsId = PhraseGroups[i]._id;
                console.log(phraseGroupsId);
                var counter = 0;
                array.push(groupsBlockDto);
                Phrases.find({_phraseGroupId: phraseGroupsId}, function (err, phrases) {
                    if (err)
                    {
                        res.send(err);
                    }
                    else
                    {
                        console.log(phrases);
                        if(phrases.length != 0)
                        {
                            array[counter].phrases = phrases;
                        }
                        else
                        {
                            array[counter].phrases = [];
                        }
                        counter = counter + 1;
                        if(counter == i)
                        {
                            response.message = "Success";
                            response.code = 200;
                            response.data = array;
                            res.json(response);
                        }
                    }
                });
                
            }
            if(PhraseGroups.length == 0)
            {
                response.message = "Failure";
                response.code = 400;
                res.json(response);
            }
        }
    }).populate('_blockId');;
});
module.exports = router;