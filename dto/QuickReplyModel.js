
var mongoose = require('mongoose');


// Define our schema
var QuickReplyModel   = new mongoose.Schema({
    text:String,
    navigation:String
});

// Export the Mongoose model
module.exports = mongoose.model('QuickReply', QuickReplyModel);