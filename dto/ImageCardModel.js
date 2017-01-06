
var mongoose = require('mongoose');
var QuickReplyModel = require('./QuickReplyModel');

// Define our schema
var ImageCardModel   = new mongoose.Schema({
    imageUrl:String,
    heading:String,
    description:String,
    urlNavigation:String,
    quickReplyModel:QuickReplyModel[],
});

// Export the Mongoose model
module.exports = mongoose.model('ImageCard', ImageCardModel);