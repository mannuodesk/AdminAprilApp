var mongoose = require('mongoose');
var Block = require('./Block');

// Define our beer schema
var ResponseMessagesSchema   = new mongoose.Schema({
    data: Object,
    type: String,
    _blockId: { type: mongoose.Schema.Types.ObjectId, ref: 'Block' },
    order:Number,
    createdOnUTC: Date,
    updatedOnUTC: Date,
    isDeleted: Boolean
});

// Export the Mongoose model
module.exports = mongoose.model('ResponseMessages', ResponseMessagesSchema);