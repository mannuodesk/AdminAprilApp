var mongoose = require('mongoose');
var Block = require('./Block');

// Define our beer schema
var PhraseGroupSchema   = new mongoose.Schema({
    _blockId : { type: mongoose.Schema.Types.ObjectId, ref: 'Block' },
    createdOnUTC: Date,
    updatedOnUTC: Date,
    isDeleted: Boolean
});

// Export the Mongoose model
module.exports = mongoose.model('PhraseGroup', PhraseGroupSchema);