var mongoose = require('mongoose');

// Define our beer schema
var ConversationRoomSchema   = new mongoose.Schema({
    name:String,
    createdOnUTC: Date,
    updatedOnUTC: Date,
    isDeleted: Boolean
});

// Export the Mongoose model
module.exports = mongoose.model('ConversationRoom', ConversationRoomSchema);