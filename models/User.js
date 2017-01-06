var mongoose = require('mongoose');


// Define our beer schema
var UserSchema   = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    channel: String,
    pictureUrl: String,
    age:Number,
    gender:String,
    latLocation: Number,
    longLocation: Number,
    deviceInfo: String,
    createdOnUTC: Date,
    updatedOnUTC: Date,
    isDeleted: Boolean
});

// Export the Mongoose model
module.exports = mongoose.model('User', UserSchema);