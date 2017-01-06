
var mongoose = require('mongoose');

// Define our schema
var UserDto   = new mongoose.Schema({
    Id:String,
    firstName: String,
    lastName: String,
    email: String,
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
module.exports = mongoose.model('UserDto', UserDto);