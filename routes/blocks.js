var express = require('express');
var router = express.Router();
var mongoose= require('mongoose');
var bodyParser = require('body-parser');
var UrlUtility = require('./../Utility/UrlUtility');
var Block = require('./../models/Block');
var Response = require('./../dto/APIResponse');
var ResponseMessage = require('./../models/ResponseMessages');

var fs = require('fs'),
request = require('request');
/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('Hi I am a Customer Page');
});

var postBlockRoute = router.route('/addBlock');
var getAllBlockRoute = router.route('/getAllBlocks');
var getResponseMessagesOfBlockRoute = router.route('/getResponseMessagesOfBlock/:blockId');
var deleteBlockRoute = router.route('/deleteBlock/:blockId');
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
deleteBlockRoute.get(function (req, res) {
    var response = new Response();
    Block.findOne({ _id: req.params.blockId })
        .exec(function (err, block) {
            if (err)
                res.send(err);
            else {
                if (block != null) {
                    block.remove();
                    response.message = "Success";
                    response.code = 200;
                    response.data = block;
                    res.json(response);
                }
                else {
                    response.message = "No Block Exists";
                    response.code = 400;
                    response.data = null;
                    res.json(response);
                }
            }
        });
});
getResponseMessagesOfBlockRoute.get(function(req, res){
    var blockId = req.params.blockId;
    var response = new Response();
    var blockObject = {
        'block':Block,
        'responseMessages':[]
    }
    Block.findOne({ _id: blockId })
        .exec(function (err, block) {
            if (err)
                res.send(err);
            else {
                ResponseMessage.find({_blockId: blockId}, function (err, responseMessages) {
                    if (err)
                    {
                        res.send(err);
                    }
                    else
                    {
                        responseMessages.sort(function(a, b){
                            return a.order - b.order;
                        });
                        blockObject.block = block;
                        blockObject.responseMessages = responseMessages;
                        response.data = blockObject;
                        response.message = "Success";
                        response.code = 200;
                        res.json(response);
                    }
                });      
            }
        });
});
postBlockRoute.post(function(req, res) {
    // Create a new instance of the Beer model
    var block = new Block();
    var response = new Response();
    var date = new Date();
    // Set the beer properties that came from the POST data
    block.name = req.body.name;
    block.order = 0;
    block.description = req.body.description;
    block.type = req.body.type;
    block.createdOnUTC = date;
    block.updatedOnUTC = date;
    block.isDeleted = false; 
    block._groupId = req.body._groupId;
    console.log(block);
    // Save the beer and check for errors
    block.save(function(err) {
        if (err) {
            res.send(err);
        }
        else {
            response.data = block;
            response.message = "Success";
            response.code = 200;
            res.json(response);
            console.log('done');
        }
    });
});

getAllBlockRoute.get(function (req, res) {
    // Create a new instance of the Beer model
    var response = new Response();
    // Save the beer and check for errors
    
    Block.find({}, null, { sort: { '_id': -1 } }, function (err, blocks) {
        if (err)
        {
            res.send(err);
        }
        else 
        {
            response.message = "Success";
            response.code = 200;
            response.data = blocks;
            res.json(response);
        }
    }).populate('_groupId');
});

module.exports = router;