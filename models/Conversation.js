var mongoose = require('mongoose');
var User = require('./User');
var ConversationRoom = require('./ConversationRoom');

// Define our beer schema
var ConversationSchema   = new mongoose.Schema({
    _user1Id : { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username1:String,
    _user2Id : { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username2:String,
    _roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'ConversationRoom' },
    createdOnUTC: Date,
    updatedOnUTC: Date,
    isDeleted: Boolean
});

// Export the Mongoose model
module.exports = mongoose.model('Conversation', ConversationSchema);