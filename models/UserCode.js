var mongoose = require('mongoose');
var User = require('./User');

// Define our beer schema
var UserCodeSchema   = new mongoose.Schema({
    randomCode:Number,
    GeneratedDateAndTime:Date,
    ExpiredDateAndTime:Date,
    _userId : { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

// Export the Mongoose model
module.exports = mongoose.model('UserCode', UserCodeSchema);