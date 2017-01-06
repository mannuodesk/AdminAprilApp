var mongoose = require('mongoose');
var Block = require('./Block');
var PhraseGroup = require('./PhraseGroup');

// Define our beer schema
var PhrasesSchema   = new mongoose.Schema({
    phraseText: String,
    phrase: String,
    _blockId : { type: mongoose.Schema.Types.ObjectId, ref: 'Block' },
    _phraseGroupId : { type: mongoose.Schema.Types.ObjectId, ref: 'PhraseGroup' },
    createdOnUTC: Date,
    updatedOnUTC: Date,
    isDeleted: Boolean
});

// Export the Mongoose model
module.exports = mongoose.model('Phrases', PhrasesSchema);