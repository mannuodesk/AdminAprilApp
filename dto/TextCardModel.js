
var mongoose = require('mongoose');
var QuickReplyModel = require('./QuickReplyModel');

// Define our schema
var TextCardModel   = new mongoose.Schema({
    text:String,
    quickReplyModel:QuickReplyModel[],
});

// Export the Mongoose model
module.exports = mongoose.model('TextCard', TextCardModel);