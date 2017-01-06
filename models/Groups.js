var mongoose = require('mongoose');


// Define our beer schema
var GroupsSchema   = new mongoose.Schema({
    name: String,
    order:Number,
    type:String,
    description:String,
    createdOnUTC: Date,
    updatedOnUTC: Date,
    isDeleted: Boolean
});

// Export the Mongoose model
module.exports = mongoose.model('Groups', GroupsSchema);