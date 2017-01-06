var express = require('express');
var router = express.Router();
var mongoose= require('mongoose');
var bodyParser = require('body-parser');
var UrlUtility = require('./../Utility/UrlUtility');
var Groups = require('./../models/Groups');
var Block = require('./../models/Block');
var Response = require('./../dto/APIResponse');
var Promises = require('promise');
//var GroupsBlock = require('./../dto/GroupsBlockDto');

var fs = require('fs'),
request = require('request');
/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('Hi I am a Customer Page');
});

var postGroupRoute = router.route('/addGroup');
var getAllGroupsRoute = router.route('/getAllGroups');
var setOrderOfGroupsRoute = router.route('/setOrderOfGroups');
var deleteOrderByIdRoute = router.route('/deleteOrderById/:orderId');
var getGroupsBlocksRoute = router.route('/getGroupsBlocks');
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
getGroupsBlocksRoute.get(function(req, res){
    var response = new Response();
    // Save the beer and check for errors
    var groupsArray = [];
    var array = [];
    var groupsBlockDto = {
        'group':Groups,
        'blocks':[]
    };       
    Groups.find({}, null, { sort: { 'order': -1 } }, function (err, groups) {
        if (err)
        {
            res.send(err);
        }
        else
        {
            var array = [];
            var groupsBlockDto = {
                'group':Groups,
                'blocks':[]
            };
            for(var i = 0; i< groups.length; i++)
            {
                groupsBlockDto = {
                    'group':Groups,
                    'blocks':[]
                };
                groupsBlockDto.group = groups[i];
                var groupId = groups[i]._id;
                console.log(groupId)
                var counter = 0;
                array.push(groupsBlockDto);
                Block.find({_groupId: groupId}, function (err, blocks) {
                    if (err)
                    {
                        res.send(err);
                    }
                    else
                    {
                        if(blocks.length != 0)
                        {
                            array[counter].blocks = blocks;
                        }
                        else
                        {
                            array[counter].blocks = [];
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
            if(groups.length == 0)
            {
                response.message = "Failure";
                response.code = 400;
                res.json(response);
            }
        }
    });
});
deleteOrderByIdRoute.get(function (req, res) {
    var response = new Response();
    Groups.findOne({ _id: req.params.orderId })
        .exec(function (err, group) {
            if (err)
                res.send(err);
            else {
                var count = 0;
                if (group != null) {
                    group.remove();
                    Groups.find({}, null, { sort: { 'order': 'ascending' } }, function (err, groups) {
                        if (err)
                        {
                            res.send(err);
                        }
                        else
                        {
                            if(groups.length != 0)
                            {
                                for(var i = 0; i < groups.length; i++ )
                                {
                                    console.log(groups[i].order);
                                    if((i+1) == groups[i].order)
                                    {

                                    }
                                    else{
                                        groups[i].order = groups[i].order - 1;
                                        groups[i].save(function(err){
                                            if(err){

                                            }
                                            else{
                                                count = count + 1;
                                                console.log('Updated');
                                            }
                                        })
                                    }
                                    if( i == count)
                                    {
                                        response.message = "Success";
                                        response.code = 200;
                                        response.data = group;
                                        res.json(response);
                                    }
                                }
                            }
                            else{
                                response.message = "No Group Exists";
                                response.code = 400;
                                response.data = null;
                                res.json(response);
                            }
                        }
                    });
                }
                else {
                    response.message = "No Group Exists";
                    response.code = 400;
                    response.data = null;
                    res.json(response);
                }
            }
        });
});
setOrderOfGroupsRoute.post(function(req, res){
    var oldIndex = req.body.oldIndex;
    var newIndex = req.body.newIndex;
    var response = new Response();
    var groupId = req.body.groupId;
    Groups.find({_id: groupId}, function (err, groups) {
        if (err)
        {
            res.send(err);
        }
        else
        {
            if(groups.length != 0)
            {
                Groups.find({order: newIndex}, function (err, gr) {
                    if (err)
                    {
                        res.send(err);
                    }
                    else
                    {
                        if(gr.length != 0)
                        {
                            Groups.update({ _id: gr[0]._doc._id },{order:oldIndex},{},function(err, group)
                            {
                                if (err)
                                {
                                    res.send(err);
                                }
                                else
                                {
                                    Groups.update({ _id: groupId },{order:newIndex},{},function(err, group)
                                    {
                                        if(err)
                                        {
                                            res.json(err);
                                        }
                                        else
                                        {
                                            response.message = "Success";
                                            response.code = 200;
                                            res.json(response);
                                        }
                                    });
                                }
                            });            
                        }
                    }
                });
            }  
        }
    });
});
postGroupRoute.post(function(req, res) {
    // Create a new instance of the Beer model
    var group = new Groups();
    var response = new Response();
    var date = new Date();
    // Set the beer properties that came from the POST data
    Groups.find({}, null, { sort: { '_id': -1 } }, function (err, groups) {
        if (err)
        {
            res.send(err);
        }
        else
        {
            var order = 0;
            for( var i = 0;i < groups.length; i++)
            {
                if( order < groups[i].order)
                {
                    order = groups[i].order;
                }
            }
            group.name = req.body.name;
            group.order = order + 1;
            group.description = req.body.description;
            group.type = req.body.type;
            group.createdOnUTC = date;
            group.updatedOnUTC = date;
            group.isDeleted = false; 
            console.log(group);
            // Save the beer and check for errors
            group.save(function(err) {
                if (err) {
                    res.send(err);
                }
                else {
                    response.data = group;
                    response.message = "Success";
                    response.code = 200;
                    res.json(response);
                    console.log('done');
                }
            });   
        }
    });
});

getAllGroupsRoute.get(function (req, res) {
    // Create a new instance of the Beer model
    var response = new Response();
    // Save the beer and check for errors
    
    Groups.find({}, null, { sort: { 'order': -1 } }, function (err, groups) {
        if (err)
        {
            res.send(err);
        }
        else
        {
            response.message = "Success";
            response.code = 200;
            response.data = groups;
            res.json(response);
        }
    });
});

module.exports = router;