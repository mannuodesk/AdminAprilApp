var mongoose = require('mongoose');
var User = require('./User');
var Conversation = require('./Conversation');

// Define our beer schema
var ConversationMessagesSchema   = new mongoose.Schema({
    messageType: String,
    messageText: String,
    messageData:Object,
    _conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' },
    _messageToUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    _messageFromUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdOnUTC: Date,
    updatedOnUTC: Date,
    isDeleted: Boolean
});

// Export the Mongoose model
module.exports = mongoose.model('ConversationMessages', ConversationMessagesSchema);