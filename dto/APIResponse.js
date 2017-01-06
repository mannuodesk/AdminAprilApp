
var mongoose = require('mongoose');


// Define our schema
var APIResponse   = new mongoose.Schema({
    message:String,
    code:Number,
    data : Object
});

// Export the Mongoose model
module.exports = mongoose.model('APIResponse', APIResponse);