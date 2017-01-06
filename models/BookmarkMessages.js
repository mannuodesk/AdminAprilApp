var mongoose = require('mongoose');
var ConversationMessages = require('./ConversationMessages');
var User = require('./User');

// Define our beer schema
var BookmarkMessagesSchema   = new mongoose.Schema({
    _userId : { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    _messageId : { type: mongoose.Schema.Types.ObjectId, ref: 'ConversationMessages' },
    createdOnUTC: Date,
    updatedOnUTC: Date,
    isDeleted: Boolean
});

// Export the Mongoose model
module.exports = mongoose.model('BookmarkMessages', BookmarkMessagesSchema);