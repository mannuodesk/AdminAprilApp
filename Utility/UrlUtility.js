var express = require('express');
var router = express.Router();
var mongoose= require('mongoose');
var bodyParser = require('body-parser');

var UtilityFile = function Constructor() {

};


UtilityFile.prototype.getURL = function () {
    // Connection URL. This is where your mongodb server is running.
    //var url = 'mongodb://localhost:27017/AprilApp';

   var url ='mongodb://mannuodesk:sajjad1214@ds063186.mlab.com:63186/aprilapp';
  return url;
};

/**
 * Created by Tauqeer on 11-08-2016.
 */

module.exports = UtilityFile;