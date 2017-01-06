var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var UrlUtility = require('./../Utility/UrlUtility');
var Response = require('./../dto/APIResponse');
var BookmarkMessages = require('./../models/BookmarkMessages');
var ConversationMessages = require('./../models/ConversationMessages');

//GET home page. 
router.get('/', function (req, res, next) {
    res.render('index', { title: 'Express' });
});

var bookmarkMessageRoute = router.route('/bookmarkMessage');
var getAllBookMarkMessagesRoute = router.route('/getAllBookMarkMessages/:_userId');
var deleteBookMarkMessagesRoute = router.route('/getAllBookMarkMessages/:_bookmarkMessageId');
var chatHistoryRoute = router.route('/chatHistory/:conversationId/:pageIndex/:pageSize');
var utility = new UrlUtility(
    {
    });
// Connection URL. This is where your mongodb server is running.
var url = utility.getURL();
mongoose.connect(url, function (err, db) {
    if (err) {
        console.log("Failed to Connect to MongoDB");
    }
    else {
        console.log("Successfully Connected");
    }
});
chatHistoryRoute.get(function (req, res) {
    var response = new Response();
    var conversationId = req.params.conversationId;
    var perPage = parseInt(req.params.pageSize);
    var pageIndex = parseInt(req.params.pageIndex);
    ConversationMessages.find({ '_conversationId': conversationId }, null, { sort: { 'createdOnUTC': 'ascending' } }, function (err, conversationMessages) {
        if (err) {
            res.send(err);
        }
        else {
            response.message = "Success";
            response.code = 200;
            response.data = conversationMessages;
            res.json(response);
        }
    }).limit(perPage).skip(perPage * pageIndex);
});
deleteBookMarkMessagesRoute.get(function (req, res) {
    var response = new Response();
    var _bookmarkMessageId = req.params._bookmarkMessageId;
    BookmarkMessages.findOne({ _id: _bookmarkMessageId })
        .exec(function (err, bookmarkMessage) {
            if (err)
                res.send(err);
            else {
                if (bookmarkMessage != null) {
                    bookmarkMessage.remove();
                    response.message = "Success";
                    response.code = 200;
                    response.data = bookmarkMessage;
                    res.json(response);
                }
                else {
                    response.message = "No bookmark message Exists";
                    response.code = 400;
                    response.data = null;
                    res.json(response);
                }
            }
        });
});

getAllBookMarkMessagesRoute.get(function (req, res) {
    var date = new Date();
    var _userId = req.params._userId;
    var response = new Response();
    var array = [];
    BookmarkMessages.find({ '_userId': _userId }, null, { sort: { '_id': -1 } }, function (err, bookmarkMessages) {
        if (err) {
            res.send(err);
        }
        else {
            var count = 0;
            if (bookmarkMessages.length != 0) {
                for (var i = 0; i < bookmarkMessages.length; i++) {
                    BookmarkMessages.find({ '_id': bookmarkMessages[i]._messageId }, null, { sort: { '_id': -1 } }, function (err, bookmarkMessages) {
                        if (err) {
                            res.send(err);
                        }
                        else {
                            if (bookmarkMessages.length != 0) {
                                array.push(bookmarkMessages[0]);
                            }
                            count = count + 1;
                            if (count == i) {
                                response.message = "Success";
                                response.code = 200;
                                response.data = array;
                                res.json(response);
                            }
                        }
                    });
                }
            }
            else {
                response.message = "Success";
                response.code = 200;
                response.data = array;
                res.json(response);
            }
        }
    });
});

bookmarkMessageRoute.post(function (req, res) {
    var date = new Date();
    var response = new Response();
    var bookmarkMessage = new BookmarkMessages();
    var _userId = req.body._userId;
    var _messageId = req.body._messageId;
    bookmarkMessage._userId = _userId;
    bookmarkMessage._messageId = _messageId;
    bookmarkMessage.createdOnUTC = date;
    bookmarkMessage.updatedOnUTC = date;
    bookmarkMessage.isDeleted = false;
    bookmarkMessage.save(function (err) {
        if (err) {

        }
        else {
            response.message = "Success";
            response.code = 200;
            response.data = bookmarkMessage;
            res.json(response);
        }
    });
});

module.exports = router;


