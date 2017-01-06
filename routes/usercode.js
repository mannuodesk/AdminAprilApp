var express = require('express');
var router = express.Router();
var mongoose= require('mongoose');
var UrlUtility = require('./../Utility/UrlUtility');
var Response = require('./../dto/APIResponse');
var User = require('./../models/User');
var UserCode = require('./../models/UserCode');
var nodemailer = require('nodemailer');
var Pass = require('./../Utility/Pass');
var multipart = require('connect-multiparty');
var fs = require("fs");
var ResponseMessage = require('./../models/ResponseMessages');
var uuid = require('node-uuid');
var multipartMiddleware = multipart();

var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'aprilapp14@gmail.com', // Your email id
            pass: 'bro123=H$' // Your password
        }
    });

 //GET home page. 
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

var generateUserCodeRoute = router.route('/generateUserCode/:email');
var getAllUserCodeRoute = router.route('/getAllUserCode');
var checkUserCodeRoute = router.route('/checkUserCode/:email/:code');
var updatePasswordRoute = router.route('/updatePassword/:email/:password/:code');
var uploadPictureRoute = router.route('/uploadPicture');
var utility = new UrlUtility(
    {
    });
// Connection URL. This is where your mongodb server is running.
var url =utility.getURL();
mongoose.connect(url, function (err, db) {
    if(err)
    {
        console.log("Failed to Connect to MongoDB");
    }
    else {
        console.log("Successfully Connected");
    }
});
uploadPictureRoute.post(multipartMiddleware, function (req, res) {
   var response = new Response();
   var extension = "";
   var responseMessageId = req.body.responseMessageId;
   var type = req.body.type;
   var indexId = req.body.indexId;
   var index = indexId.charAt(0);
    if(req.files.file.headers['content-type'] == 'image/jpeg')
    {
        extension = ".jpg";
    }
    else if(req.files.file.headers['content-type'] == 'image/png')
    {
        extension = ".png";
    }
   var imageName = uuid.v4() + extension;
   var fullUrl = req.protocol + '://' + req.get('host');
   var file = __dirname + "./../public/images/" + imageName;
   fs.readFile( req.files.file.path, function (err, data) {
      fs.writeFile(file, data, function (err) {
         if( err ){
            console.log( err );
            }else{
               ResponseMessage.findOne({ _id: responseMessageId }
                ,function (err, responseMessage) {
                    if (err)
                        res.send(err);
                    else {
                        if(type == "image")
                        {
                            ResponseMessage.update({ _id: responseMessage._doc._id },{'data.pictureUrl':fullUrl + "/images/" + imageName},{},function(err, user)
                            {
                                if(err)
                                {
                                        res.json(err);
                                }
                                else
                                {
                                        response.data = fullUrl + "/images/" + imageName;
                                        response.message = "Success";
                                        response.code = 200;
                                        res.json(response);
                                }
                            });
                        }
                        else{
                            var query = 'data.'+index-1+'.pictureUrl';
                            ResponseMessage.findOneAndUpdate(
                                {'data.indexId':indexId},
                                {$set:{
                                    'data.$.pictureUrl': fullUrl + "/images/" + imageName
                                }},
                                {safe: true, upsert: true},
                                function(err, model) {
                                    if(err)
                                        console.log(err);
                                    else{
                                        console.log(model);
                                        response.data = fullUrl + "/images/" + imageName;
                                        response.message = "Success";
                                        response.code = 200;
                                        res.json(response);
                                    }
                                }
                            );
                            
                        }
                    }
                }); 
               
            }
      });
   });
});
updatePasswordRoute.get(function(req, res){
    var email = req.params.email;
    var pass = new Pass();
    var password = req.params.password;
    var response = new Response();
    var code = req.params.code;
    var date = new Date();
    User.findOne({ email: email })
        .exec(function (err, user) {
            if (err)
                res.send(err);
            else {
                if(user != null)
                {
                    if(user._doc.channel == "email")
                    {
                        UserCode.findOne({ _userId: user._doc._id })
                        .exec(function (err, userCodeCheck) {
                            if (err)
                                res.send(err);
                            else {
                                if(userCodeCheck != null)
                                {
                                    if(date <= userCodeCheck.ExpiredDateAndTime)
                                    {
                                        if(userCodeCheck.randomCode == code)
                                        {
                                            userCodeCheck.remove();
                                            password = pass.createHash(password);
                                            User.update({ _id: user._doc._id },{password:password},{},function(err, user)
                                            {
                                                if(err)
                                                {
                                                    res.json(err);
                                                }
                                                else
                                                {
                                                    response.message = "Success: Password Successfully Updated";
                                                    response.code = 200;
                                                    res.json(response);
                                                }
                                            });
                                        }
                                        else
                                        {
                                            response.message = "Failure:Code is not Valid.";
                                            response.code = 400;
                                            res.json(response);
                                        }
                                    }
                                    else{
                                        response.message = "Failure:Code has Expired.";
                                        response.code = 400;
                                        res.json(response);
                                    }
                                }
                                else
                                {
                                    response.message = "Failure: Code does not exist.";
                                    response.code = 200;
                                    res.json(response);     
                                }
                            }
                        });
                    }
                    else
                    {
                        response.message = "Failure: Cannot Reset Password";
                        response.code = 400;
                        response.data = user._doc.channel;
                        res.json(response);
                    }
                }
                else
                {
                    response.message = "User Does not Exists";
                    response.code = 400;
                    res.json(response);
                }
            }
        });
});

checkUserCodeRoute.get(function(req, res){
     var response = new Response();
     var code = req.params.code;
     var date = new Date();
     User.findOne({ email: req.params.email })
        .exec(function (err, user) {
            if (err)
                res.send(err);
            else {
                if(user != null)
                {
                    if(user._doc.channel == "email")
                    {
                        UserCode.findOne({ _userId: user._doc._id })
                        .exec(function (err, userCodeCheck) {
                            if (err)
                                res.send(err);
                            else {
                                if(userCodeCheck != null)
                                {
                                    if(date <= userCodeCheck.ExpiredDateAndTime)
                                    {
                                        if(userCodeCheck.randomCode == code)
                                        {
                                            userCodeCheck.remove();
                                            response.message = "Success:Code is Valid.";
                                            response.code = 200;
                                            res.json(response);
                                        }
                                        else
                                        {
                                            response.message = "Failure:Code is not Valid.";
                                            response.code = 400;
                                            res.json(response);
                                        }
                                    }
                                    else{
                                        response.message = "Failure:Code has Expired.";
                                        response.code = 400;
                                        res.json(response);
                                    }
                                }
                                else
                                {
                                    response.message = "Failure: Code does not exist.";
                                    response.code = 200;
                                    res.json(response);     
                                }
                            }
                        });
                    }
                    else
                    {
                        response.message = "Failure: Cannot Reset Password";
                        response.code = 400;
                        response.data = user._doc.channel;
                        res.json(response);
                    }
                }
                else{
                        response.message = "User Does not Exists";
                        response.code = 400;
                        res.json(response);
                }
            }
        });
});

getAllUserCodeRoute.get(function(req, res){
    var response = new Response();
    // Save the beer and check for errors
    
    UserCode.find({}, null, { sort: { '_id': -1 } }, function (err, usersCode) {
        if (err)
        {
            res.send(err);
        }
        else
        {
            response.message = "Success";
            response.code = 200;
            response.data = usersCode;
            res.json(response);
        }
    });
});

generateUserCodeRoute.get(function (req, res) {
    // Create a new instance of the Beer model
    var response = new Response();
    var userCode = new UserCode();
    var date = new Date();
    var date2 = new Date();
    var email = req.params.email;
      User.findOne({ email: email })
        .exec(function (err, user) {
            if (err)
                res.send(err);
            else {
                if(user != null)
                {
                    if(user._doc.channel == "email")
                    {
                        UserCode.findOne({ _userId: user._doc._id })
                        .exec(function (err, userCodeCheck) {
                            if (err)
                                res.send(err);
                            else {
                                if(userCodeCheck != null)
                                {
                                    if(date <= userCodeCheck.ExpiredDateAndTime)
                                    {
                                        var text = 'Your Code for Reset Password : ' + userCodeCheck.randomCode;
                                        var mailOptions = {
                                            from: 'aprilapp14@gmail.com', // sender address
                                            to: email, // list of receivers
                                            subject: 'April App | Reset Password', // Subject line
                                            text: text //, // plaintext body
                                            // html: '<b>Hello world ✔</b>' // You can choose to send an HTML body instead
                                        };
                                        transporter.sendMail(mailOptions, function(error, info){
                                            if(error){
                                                console.log(error);
                                                res.json({yo: 'error'});
                                            }else{
                                                response.message = "Success:Same Code has been Mailed to you Again.";
                                                response.code = 200;
                                                res.json(response);
                                            };
                                        });
                                    }
                                    else{
                                        userCodeCheck.randomCode = Math.floor(Math.random()*90000) + 10000;
                                        userCodeCheck.GeneratedDateAndTime = date;
                                        userCodeCheck.ExpiredDateAndTime = date2.setMinutes(date2.getMinutes() + 10);
                                        UserCode.update({ _id: userCodeCheck._doc._id },{randomCode:userCodeCheck.randomCode,GeneratedDateAndTime:userCodeCheck.GeneratedDateAndTime,ExpiredDateAndTime:userCodeCheck.ExpiredDateAndTime},{},function(err, user)
                                        {
                                            if(err)
                                            {
                                                res.json(err);
                                            }
                                            else
                                            {
                                                 var text = 'Your Code for Reset Password : ' + userCodeCheck.randomCode;
                                                    var mailOptions = {
                                                        from: 'aprilapp14@gmail.com', // sender address
                                                        to: email, // list of receivers
                                                        subject: 'April App | Reset Password', // Subject line
                                                        text: text //, // plaintext body
                                                        // html: '<b>Hello world ✔</b>' // You can choose to send an HTML body instead
                                                    };
                                                    transporter.sendMail(mailOptions, function(error, info){
                                                        if(error){
                                                            console.log(error);
                                                            res.json({yo: 'error'});
                                                        }else{
                                                            response.message = "Success:New Code has been Mailed to you.";
                                                            response.code = 200;
                                                            res.json(response);
                                                        };
                                                    });
                                            }
                                        });
                                    }
                                }
                                else
                                {
                                    userCode.randomCode = Math.floor(Math.random()*90000) + 10000;
                                    userCode.GeneratedDateAndTime = date;
                                    userCode.ExpiredDateAndTime = date2.setMinutes(date2.getMinutes() + 10);
                                    userCode._userId = user._doc._id;
                                    userCode.save(function(err) {
                                        if (err) {
                                            res.send(err);
                                        }
                                        else {
                                            var text = 'Your Code for Reset Password : ' + userCode.randomCode;
                                            var mailOptions = {
                                                from: 'aprilapp14@gmail.com', // sender address
                                                to: email, // list of receivers
                                                subject: 'April App | Reset Password', // Subject line
                                                text: text //, // plaintext body
                                                // html: '<b>Hello world ✔</b>' // You can choose to send an HTML body instead
                                            };
                                            transporter.sendMail(mailOptions, function(error, info){
                                                if(error){
                                                    console.log(error);
                                                    res.json({yo: 'error'});
                                                }else{
                                                    response.message = "Success: Code has been Mailed to you.";
                                                    response.code = 200;
                                                    res.json(response);
                                                };
                                            });
                                        }
                                    });
                                }
                            }
                        });
                    }
                    else
                    {
                        response.message = "Failure: Cannot Reset Password";
                        response.code = 400;
                        response.data = user._doc.channel;
                        res.json(response);
                    }
                }
                else{
                        response.message = "User Does not Exists";
                        response.code = 400;
                        res.json(response);
                }
        }
    });
});
module.exports = router;


