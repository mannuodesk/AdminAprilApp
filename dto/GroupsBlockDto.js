
var mongoose = require('mongoose');
var Block = require('./../models/Block');
var Groups = require('./../models/Groups');

// Define our schema
var GroupsBlockDtoSchema   = new mongoose.Schema({
    blocks:Block[],
    group:Groups
});

// Export the Mongoose model
module.exports = mongoose.model('GroupsBlockDto', GroupsBlockDtoSchema);