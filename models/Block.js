var mongoose = require('mongoose');
var Groups = require('./Groups');

// Define our beer schema
var BlockSchema   = new mongoose.Schema({
    name: String,
    order:Number,
    type:String,
    description:String,
    createdOnUTC: Date,
    updatedOnUTC: Date,
    isDeleted: Boolean,
    _groupId : { type: mongoose.Schema.Types.ObjectId, ref: 'Groups' }
});

// Export the Mongoose model
module.exports = mongoose.model('Block', BlockSchema);