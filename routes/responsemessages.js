var express = require('express');
var router = express.Router();
var mongoose= require('mongoose');
var ResponseMessage = require('./../models/ResponseMessages');
var UrlUtility = require('./../Utility/UrlUtility');
var Response = require('./../dto/APIResponse');

 //GET home page. 
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

var postResponseMessageRoute = router.route('/addResponseMessage');
var getAllResponseMessagesRoute = router.route('/getAllResponseMessages');
var getAllResponseMessagesOnBlockRoute = router.route('/getAllResponseMessagesOnBlock/:blockId');
var updateTitleRoute = router.route('/updateTitle/:responseMessageId/:indexId/:type/:titleText');
var updateDescriptionRoute = router.route('/updateDescription/:responseMessageId/:indexId/:descriptionText');
var updateArticleRoute = router.route('/updateArticle')
var updateUrlRoute = router.route('/updateUrl/:responseMessageId/:indexId/:urlText');
var deleteResponseMessageRoute = router.route('/deleteResponseMessage/:responseMessageId');
var deleteAddButtonRoute = router.route('/deleteAddButton/:responseMessageId/:addButtonId/:type');
var deleteQuickReplyRoute = router.route('/deleteQuickReply/:responseMessageId/:_quickReplyId');
var addAddButtonRoute = router.route('/addAddButton');
var addGalleryCardRoute = router.route('/addGalleryCard');
var deleteGalleryCardRoute = router.route('/deleteGalleryCard/:responseMessageId/:galleryCardId');
var addQuickReplyRoute = router.route('/addQuickReply');
var sortingOfResponseMessagesRoute = router.route('/sortingOfResponseMessages');
var utility = new UrlUtility(
    {
    });
var url =utility.getURL();
mongoose.connect(url, function (err, db) {
    if(err){
        console.log("Failed to Connect to MongoDB");
    }
    else {
        console.log("Successfully Connected");
    }
});
deleteGalleryCardRoute.get(function(req, res){
    var responseMessageId = req.params.responseMessageId;
    var galleryCardId = req.params.galleryCardId;
    var response = new Response();
    ResponseMessage.findByIdAndUpdate(
            responseMessageId,
            {$pull: {'data':{_addButtonId: galleryCardId}}},
            {safe: true, upsert: true},
            function(err, model) {
                if(err)
                    console.log(err);
                else{
                    response.message = "Success";
                    response.code = 200;
                    res.json(response);
                }
            }
        );
});
sortingOfResponseMessagesRoute.post(function(req, res){
    var oldIndex = req.body.oldIndex;
    var newIndex = req.body.newIndex;
    var response = new Response();
    var groupId = req.body.groupId;
    ResponseMessage.find({_id: groupId}, function (err, groups) {
        if (err)
        {
            res.send(err);
        }
        else
        {
            if(groups.length != 0)
            {
                ResponseMessage.find({order: newIndex}, function (err, gr) {
                    if (err)
                    {
                        res.send(err);
                    }
                    else
                    {
                        if(gr.length != 0)
                        {
                            ResponseMessage.update({ _id: gr[0]._doc._id },{order:oldIndex},{},function(err, group)
                            {
                                if (err)
                                {
                                    res.send(err);
                                }
                                else
                                {
                                    ResponseMessage.update({ _id: groupId },{order:newIndex},{},function(err, group)
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
deleteQuickReplyRoute.get(function(req, res){
    var responseMessageId = req.params.responseMessageId;
    var addButtonId = req.params._quickReplyId;
    var response = new Response();
    ResponseMessage.findByIdAndUpdate(
            responseMessageId,
            {$pull: {'data.quickReplyButton':{_addButtonId: addButtonId}}},
            {safe: true, upsert: true},
            function(err, model) {
                if(err)
                    console.log(err);
                else{
                    response.message = "Success";
                    response.code = 200;
                    res.json(response);
                }
            }
        );
});
deleteAddButtonRoute.get(function(req, res){
    var responseMessageId = req.params.responseMessageId;
    var addButtonId = req.params.addButtonId;
    var type = req.params.type;
    var response = new Response();
    if(type == 'gallery')
    {
        ResponseMessage.update(
            { "data.indexId": responseMessageId },
            { "$pull": { 'data.$.cardAddButton': {_addButtonId:addButtonId } }},
            function(err,numAffected) {
                if(err)
                    console.log(err);
                else{
                    response.message = "Success";
                    response.code = 200;
                    res.json(response);
                }
            }
        );
    }
    else{
        ResponseMessage.findByIdAndUpdate(
            responseMessageId,
            {$pull: { 'data.cardAddButton': { _addButtonId: addButtonId } }},
            {safe: true, upsert: true},
            function(err, model) {
                if(err)
                    console.log(err);
                else{
                    response.message = "Success";
                    response.code = 200;
                    res.json(response);
                }
            }
        );
    }
});
deleteResponseMessageRoute.get(function(req, res){
    var responseMessageId = req.params.responseMessageId;
    var response = new Response();
    var count = 0;
    ResponseMessage.findOne({ _id: responseMessageId }
        ,function (err, responseMessage) {
            if (err)
                res.send(err);
            else {
                responseMessage.remove();
                ResponseMessage.find({}, null, { sort: { 'order': 'ascending' } }, function (err, groups) {
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
                                        response.data = responseMessage;
                                        res.json(response);
                                    }
                                }
                            }
                            else{
                                response.message = "No Response Message Exists";
                                response.code = 400;
                                response.data = null;
                                res.json(response);
                            }
                        }
                    });
            }
        });
})
addQuickReplyRoute.post(function(req, res){
    var responseMessageId = req.body.responseMessageId;
    var obj = req.body.data;
    var type = req.body.type
    var index = req.body.index;
    console.log(responseMessageId);
    var response = new Response();
    var id = "quickReply" + index + responseMessageId;
    obj._addButtonId = id;
    
        ResponseMessage.findByIdAndUpdate(
            responseMessageId,
            {$push: {"data.quickReplyButton": obj}},
            {safe: true, upsert: true},
            function(err, model) {
                if(err)
                    console.log(err);
                else{
                    response.message = "Success";
                    response.code = 200;
                    res.json(response);
                }
            }
        );
    
});
addAddButtonRoute.post(function(req, res){
    var responseMessageId = req.body.responseMessageId;
    var obj = req.body.data;
    var type = req.body.type
    var index = req.body.index;
    console.log(responseMessageId);
    var response = new Response();
    var id = "addbutton" + index + responseMessageId;
    obj._addButtonId = id;
    if(type == "text")
    {
        ResponseMessage.findByIdAndUpdate(
            responseMessageId,
            {$push: {"data.cardAddButton": obj}},
            {safe: true, upsert: true},
            function(err, model) {
                if(err)
                    console.log(err);
                else{
                    response.message = "Success";
                    response.code = 200;
                    res.json(response);
                }
            }
        );
    }
    else{

        ResponseMessage.update(
            { "data.indexId": responseMessageId },
            { "$push": { "data.$.cardAddButton": obj } },
            function(err,numAffected) {
                if(err)
                    console.log(err);
                else{
                    response.message = "Success";
                    response.code = 200;
                    res.json(response);
                }
            }
        );
    }
    
});
addGalleryCardRoute.post(function(req, res){
    var responseMessageId = req.body.responseMessageId;
    console.log(responseMessageId);
    var response = new Response();
    var obj = req.body.data;
    console.log(obj);
    obj.indexId = obj.indexId + responseMessageId;
    ResponseMessage.findByIdAndUpdate(
        responseMessageId,
        {$push: {"data": obj}},
        {safe: true, upsert: true},
        function(err, model) {
            if(err)
                console.log(err);
            else{
                response.message = "Success";
                                        response.code = 200;
                                        res.json(response);
            }
        }
    );
});
updateUrlRoute.get(function(req, res){
    var responseMessageId = req.params.responseMessageId;
    var indexId = req.params.indexId;
    var urlText = req.params.urlText;
    var response = new Response();
    ResponseMessage.findOne({ _id: responseMessageId }
        ,function (err, responseMessage) {
            if (err)
                res.send(err);
            else {
                ResponseMessage.findOneAndUpdate(
                                {'data.indexId':indexId},
                                {$set:{
                                    'data.$.url': urlText
                                }},
                                {safe: true, upsert: true},
                                function(err, model) {
                                    if(err)
                                        console.log(err);
                                    else{
                                        response.message = "Success";
                                        response.code = 200;
                                        res.json(response);
                                    }
                                }
                            );
            }
        });
});
updateDescriptionRoute.get(function(req, res){
    var responseMessageId = req.params.responseMessageId;
    var descriptionText = req.params.descriptionText;
    var indexId = req.params.indexId;
    var response = new Response();
    ResponseMessage.findOne({ _id: responseMessageId }
        ,function (err, responseMessage) {
            if (err)
                res.send(err);
            else {
                ResponseMessage.findOneAndUpdate(
                                {'data.indexId':indexId},
                                {$set:{
                                    'data.$.description': descriptionText
                                }},
                                {safe: true, upsert: true},
                                function(err, model) {
                                    if(err)
                                        console.log(err);
                                    else{
                                        response.message = "Success";
                                        response.code = 200;
                                        res.json(response);
                                    }
                                }
                            );
            }
        });
});
updateArticleRoute.post(function(req, res){
    var responseMessageId = req.body.responseMessageId;
    var articleText = req.body.text;
    var response = new Response();
    ResponseMessage.update({ _id: responseMessageId },{'data.articleText':articleText},{},function(err, user)
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
});
updateTitleRoute.get(function(req, res){
    var responseMessageId = req.params.responseMessageId;
    var indexId = req.params.indexId;
    var type = req.params.type;
    var titleText = req.params.titleText;
    var response = new Response();
    ResponseMessage.findOne({ _id: responseMessageId }
        ,function (err, responseMessage) {
            if (err)
                res.send(err);
            else {
                if(type == 'gallery')
                {
                    ResponseMessage.findOneAndUpdate(
                                {'data.indexId':indexId},
                                {$set:{
                                    'data.$.text': titleText
                                }},
                                {safe: true, upsert: true},
                                function(err, model) {
                                    if(err)
                                        console.log(err);
                                    else{
                                        response.message = "Success";
                                        response.code = 200;
                                        res.json(response);
                                    }
                                }
                            );
                }
                else{
                    ResponseMessage.update({ _id: responseMessage._doc._id },{'data.text':titleText},{},function(err, user)
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
            }
        });
});
getAllResponseMessagesOnBlockRoute.get(function(req, res){
    var blockId = req.params.blockId;
    var response = new Response();
    ResponseMessage.find({_blockId: blockId}, function (err, responseMessages) {
        if (err)
        {
            res.send(err);
        }
        else
        {
            response.data = responseMessages;
            response.message = "Success";
            response.code = 200;
            res.json(response);
        }
    });                
});
postResponseMessageRoute.post(function(req, res) {
    // Create a new instance of the Beer model
    var responseMessage = new ResponseMessage();
    var response = new Response();
    var date = new Date();
    console.log(req.body.data);
    // Set the beer properties that came from the POST data
        ResponseMessage.find({}, null, { sort: { '_id': -1 } }, function (err, groups) {
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
                responseMessage.data = req.body.data;
                responseMessage.type = req.body.type;
                responseMessage._blockId = req.body._blockId;
                responseMessage.createdOnUTC = date;
                responseMessage.updatedOnUTC = date;
                responseMessage.isDeleted = false; 
                responseMessage.order = order + 1;
                // Save the beer and check for errors
                responseMessage.save(function(err) {
                    if (err) {
                        res.send(err);
                    }
                    else {
                        if(responseMessage.type == 'gallery')
                        {
                            ResponseMessage.findOneAndUpdate(
                                {'_id':responseMessage._id,},
                                {$set:{
                                    'data.0.indexId': responseMessage.data[0].indexId + responseMessage._id
                                }},
                                {safe: true, upsert: true},
                                function(err, model) {
                                    if(err)
                                        console.log(err);
                                    else{
                                        response.data = responseMessage;
                                        response.message = "Success: New Created";
                                        response.code = 200;
                                        res.json(response);
                                    }
                                }
                            );
                        }
                        else
                        {
                            response.data = responseMessage;
                            response.message = "Success: New Created";
                            response.code = 200;
                            res.json(response);
                        }
                    }
                });
            }
        });
});
getAllResponseMessagesRoute.get(function (req, res) {
    // Create a new instance of the Beer model
    var response = new Response();
    // Save the beer and check for errors
    
    ResponseMessage.find({}, null, { sort: { '_id': -1 } }, function (err, responseMessages) {
        if (err)
        {
            res.send(err);
        }
        else
        {
            response.message = "Success";
            response.code = 200;
            response.data = responseMessages;
            res.json(response);
        }
    });
});
module.exports = router;


