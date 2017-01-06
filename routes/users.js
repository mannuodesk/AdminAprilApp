var express = require('express');
var router = express.Router();
var mongoose= require('mongoose');
var bodyParser = require('body-parser');
var UrlUtility = require('./../Utility/UrlUtility');
var User = require('./../models/User');
var Response = require('./../dto/APIResponse');
var UserDto = require('./../dto/UserDto');
var uuid = require('node-uuid');
var Pass = require('./../Utility/Pass');

var fs = require('fs'),
request = require('request');
/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('Hi I am a Customer Page');
});

var postUserRoute = router.route('/addUser');
var getLoginRoute = router.route('/login');
var getAllUsersRoute = router.route('/getAllUsers');
var adminUserLoginRoute = router.route('/adminUserLogin');
var getAdminUserRoute = router.route('/getAdminUser');
var deleteUserRoute = router.route('/deleteUser/:userId');
var checkUserRoute = router.route('/checkUser/:userId');
var dashboardStatsRoute = router.route('/dashboardStats');
var socialMediaLoginRoute = router.route('/socialMediaLogin');
var fullUrl = "";
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
dashboardStatsRoute.get(function(req,res){
    var response = new Response();
    
    User.find({}, null, { sort: { '_id': -1 } }, function (err, questions) {
        if (err)
        {
            res.send(err);
        }
        else
        {
            var TotalUsers = 0;
            var FbUsers = 0;
            var GoogleUsers = 0;
            var LinkedINUsers = 0;
            var TotalTodayUsers = 0;
            var TotalTodayFbUsers = 0;
            var TotalTodayGoogleUsers = 0;
            var TotalTodayLinkedINUsers = 0;
            var EmailUsers = 0;
            var TodayEmailUsers = 0;
            var date = new Date();
            var todayDate = date.getDate().toString() + "-" + date.getMonth().toString() + "-" + date.getFullYear().toString();
            
            for(var i=0; i<questions.length; i++)
            {
                if(questions[i].channel != "admin")
                {
                    if(questions[i].isDeleted != true)
                    {
                        TotalUsers = TotalUsers + 1;
                        var userDate = questions[i].createdOnUTC.getDate().toString() + "-" + questions[i].createdOnUTC.getMonth().toString() + "-" + questions[i].createdOnUTC.getFullYear().toString();
                        if(todayDate == userDate)
                        {
                            TotalTodayUsers = TotalTodayUsers + 1;
                        }
                        if(questions[i].channel == "facebook")
                        {
                            FbUsers = FbUsers + 1;
                        }
                        if(questions[i].channel == "email")
                        {
                            EmailUsers = EmailUsers + 1;
                        }
                        if(questions[i].channel == "gmail")
                        {
                            GoogleUsers = GoogleUsers + 1;
                        }
                        if(questions[i].channel == "linkedin")
                        {
                            LinkedINUsers = LinkedINUsers + 1;
                        }
                        if(questions[i].channel == "facebook" && todayDate == userDate)
                        {
                            TotalTodayFbUsers = TotalTodayFbUsers + 1;
                        }
                        if(questions[i].channel == "email" && todayDate == userDate)
                        {
                            TodayEmailUsers = TodayEmailUsers + 1;
                        }
                        if(questions[i].channel == "gmail" && todayDate == userDate)
                        {
                            TotalTodayGoogleUsers = TotalTodayGoogleUsers + 1;
                        }
                        if(questions[i].channel == "linkedin" && todayDate == userDate)
                        {
                            TotalTodayLinkedINUsers = TotalTodayLinkedINUsers + 1;
                        }
                    }
                }
            }
            var ResultObject = {
                'TotalUsers':TotalUsers,
                'FbUsers': FbUsers,
                'GoogleUsers' : GoogleUsers,
                'LinkedINUsers' : LinkedINUsers,
                'TotalTodayUsers' : TotalTodayUsers,
                'TotalTodayLinkedINUsers' : TotalTodayLinkedINUsers,
                'TotalTodayGoogleUsers' : TotalTodayGoogleUsers,
                'TotalTodayFbUsers': TotalTodayFbUsers,
                'TodayEmailUsers': TodayEmailUsers,
                'EmailUsers': EmailUsers
            };
            response.message = "Success";
            response.code = 200;
            response.data = ResultObject;
            res.json(response);
        }
    });
});
checkUserRoute.get(function(req, res){
    var response = new Response();
    User.findOne({ _id: req.params.userId })
        .exec(function (err, user) {
            if (err)
                res.send(err);
            else {
                if (user != null) {
                    if(user._doc.isDeleted == true)
                    {
                        response.message = "User has been Deleted";
                        response.code = 200;
                        res.json(response);
                    }
                    else
                    {
                        response.message = "Success";
                        response.code = 200;
                        response.data = user;
                        res.json(response);
                    }
                }
                else {
                    response.message = "No User Exists";
                    response.code = 400;
                    response.data = null;
                    res.json(response);
                }
            }
        });
});
deleteUserRoute.get(function (req, res) {
    var response = new Response();
    User.findOne({ _id: req.params.userId })
        .exec(function (err, user) {
            if (err)
                res.send(err);
            else {
                if (user != null) {
                    user.remove();
                    response.message = "Success";
                    response.code = 200;
                    res.json(response);

                }
                else {
                    response.message = "No Group Exists";
                    response.code = 400;
                    response.data = null;
                    res.json(response);
                }


            }
        });

});

getAdminUserRoute.post(function (req,res){
    var Id = req.body.userId;
    var response = new Response();
    User.find({'_id':Id}, function(err, exuser){

    if (!exuser){
                
    }
    else {
        if(exuser.length != 0)
        {
            var name = exuser[0]._doc.firstName + " " + exuser[0]._doc.lastName;
            var obj = {'name':name,'pictureUrl':exuser[0]._doc.pictureUrl};
            response.data = obj;
            response.message = "Success";
            response.code = 200;                       
            res.json(response);
        }
    }

    });
});
adminUserLoginRoute.post(function(req,res){
    var email = req.body.email;
    var response = new Response();
    var pass = new Pass();
    var password = req.body.password;
    User.find({ 'email': email}, function(err, exuser) {
        if (!exuser){
                
            }
        else {
            if(exuser.length == 0)
            {
                 response.message = "Invalid User Name or Password";
                 response.code = 400;                       
                 res.json(response);
            }
            else{
                var validate = pass.validateHash(exuser[0]._doc.password,password);
                if(validate == true)
                {
                    if(exuser[0]._doc.isDeleted == true)
                    {
                        response.message = "User Has been deleted";
                        response.code = 400;                       
                        res.json(response);
                    }
                    else
                    {
                        response.data = exuser[0]._doc._id;
                        response.message = "Success";
                        response.code = 200;                       
                        res.json(response);
                    }
                }
                else
                {
                    response.message = "Invalid User Name or Password";
                    response.code = 400;                       
                    res.json(response);
                }
            }
        }
    });
});
getLoginRoute.post(function(req, res){
    var user = new User();
    var pass = new Pass();
    var response = new Response();
    var email = req.body.email;
    var channel = req.body.channel;
    console.log(email);
    console.log(channel);
    if(channel == "email")
    {
        var password = req.body.password;
       
        User.find({ 'email': email}, function(err, exuser) {
            if (!exuser){
                
            }
            else {
                if(exuser.length == 0)
                {
                    response.message = "User does not Exist";
                    response.code = 400;
                                        
                    res.json(response);
                }
                else
                {
                    var validate = pass.validateHash(exuser[0]._doc.password,password);

                    if(exuser[0]._doc.channel == channel && validate == true)
                    {
                        if(exuser[0]._doc.isDeleted == true)
                        {
                            response.message = "User Has been deleted";
                            response.code = 400;                       
                            res.json(response);
                        }
                        else
                        {
                            response.data = exuser[0]._doc;
                            response.message = "Success";
                            response.code = 200;
                                            
                            res.json(response);
                        }       
                        
                    }
                    else
                    {
                        if(validate == false)
                        {
                            response.data = exuser[0]._doc.channel;
                            response.message = "Invalid User Name or Password";
                            response.code = 400;
                                            
                            res.json(response);
                        }
                        else
                        {
                            response.data = exuser[0]._doc.channel;
                            response.message = "User has tried to Login from wrong channel.";
                            response.code = 400;
                                            
                            res.json(response);
                        }
                    }
                    
                }
            }
        });
    }
    else
    {
        var pictureUrl = req.body.pictureUrl;
        User.find({ 'email': email,'channel':channel }, function(err, exuser) {
            if (!exuser){
                
            }
            else {
                if(exuser.length == 0)
                {
                    response.message = "No User Found";
                    response.code = 400;
                                        
                    res.json(response);
                }
                else
                {
                    download(pictureUrl, exuser[0]._doc._id, function(){
                        User.findById(exuser[0]._doc._id, function(err, p) {
                            if (!p)
                                console.log("Couldnt Updated");
                            else {
                                if(p._doc.isDeleted == true)
                                {
                                   response.message = "User Has been deleted";
                                   response.code = 400;                       
                                   res.json(response);
                                }
                                else
                                {
                                    response.data = p._doc;
                                    response.message = "Success";
                                    response.code = 200;
                                                        
                                    res.json(response);
                                }
                            }     
                        });
                            console.log('done');
                        });
                        
                    }
                    
                }
            });
        };
    

});
postUserRoute.post(function(req, res) {
    // Create a new instance of the Beer model
    var user = new User();

    var pass = new Pass();
    var response = new Response();
    var date = new Date();
    // Set the beer properties that came from the POST data
    var email = req.body.email;
    var channel = req.body.channel;
    User.find({ 'email': email,'channel':channel }, function(err, exuser) {

        if (!exuser){
            
        }
        else {
            if(exuser.length == 0)
            { 
                User.findOne({'email': email}, function(err, result) {
                    if (err) { /* handle err */ }

                    if (result) {
                        response.message = "User is already registered with this Email. Try a new Email";
                        response.code = 400;            
                        res.json(response);
                    } else {
                        fullUrl = req.protocol + '://' + req.get('host');
                        user.firstName = req.body.firstName;
                        user.lastName = req.body.lastName;
                        user.email = req.body.email;
                        user.password = req.body.password;
                        user.password = pass.createHash(user.password);
                        user.channel = req.body.channel;
                        user.gender = 'N/A';
                        user.age = 0;
                        user.latLocation = req.body.latLocation;
                        user.longLocation = req.body.longLocation;
                        user.deviceInfo = req.body.deviceInfo;
                        user.createdOnUTC = date;
                        user.updatedOnUTC = date;
                        user.isDeleted = false;
                        if(user.channel != "email")
                        {
                            user.pictureUrl = req.body.pictureUrl;
                        }
                        else
                        {
                            user.pictureUrl = req.body.pictureUrl;
                        }
                        console.log(user);
                        // Save the beer and check for errors
                        user.save(function(err) {
                            if (err) {
                                res.send(err);
                            }
                            else {
                                if(user.channel != "email")
                                {
                                    download(user.pictureUrl, user._id, function(){
                                    User.findById(user._id, function(err, p) {
                                        if (!p)
                                            console.log("Couldnt Updated");
                                        else {
                                            response.data = p._doc;
                                            response.message = "Success";
                                            response.code = 200;
                                            
                                            res.json(response);
                                        }     
                                    });
                                        console.log('done');
                                    });
                                }
                                else
                                {
                                    response.data = user;
                                    response.message = "Success";
                                    response.code = 200;
                                            
                                    res.json(response);
                                }
                                
                            }
                        });
                    }
                });
            }
                else
                {
                    response.data = exuser[0]._doc.channel;
                    response.message = "User Already Exists";
                    response.code = 400;
                                    
                    res.json(response);
                }
            }
        });
});
socialMediaLoginRoute.post(function(req, res) {
    var user = new User();
    var pass = new Pass();
    var response = new Response();
    var date = new Date();
    var email = req.body.email;
    var channel = req.body.channel;
    User.find({ 'email': email,'channel':channel }, function(err, exuser) {

        if (!exuser){
            
        }
        else {
            if(exuser.length == 0)
            {
                User.findOne({'email': email}, function(err, result) {
                    if (err) { /* handle err */ }

                    if (result) {
                        response.message = "User is already registered with this Email. Try a new Email";
                        response.code = 400;            
                        res.json(response);
                    } else {
                        fullUrl = req.protocol + '://' + req.get('host');
                        user.firstName = req.body.firstName;
                        user.lastName = req.body.lastName;
                        user.email = req.body.email;
                        user.password = req.body.password;
                        user.password = pass.createHash(user.password);
                        user.channel = req.body.channel;
                        //user.gender = req.body.gender;
                        //user.age = req.body.age;
                        user.latLocation = req.body.latLocation;
                        user.longLocation = req.body.longLocation;
                        user.deviceInfo = req.body.deviceInfo;
                        user.createdOnUTC = date;
                        user.updatedOnUTC = date;
                        user.isDeleted = false;
                        if(user.channel != "email")
                        {
                            user.pictureUrl = req.body.pictureUrl;
                        }
                        else
                        {
                            user.pictureUrl = req.body.pictureUrl;
                        }
                        
                        
                        console.log(user);
                        // Save the beer and check for errors
                        user.save(function(err) {
                            if (err) {
                                res.send(err);
                            }
                            else {
                                if(user.channel != "email")
                                {
                                    download(user.pictureUrl, user._id, function(){
                                    User.findById(user._id, function(err, p) {
                                        if (!p)
                                            console.log("Couldnt Updated");
                                        else {
                                            response.data = p._doc;
                                            response.message = "Success : Registered";
                                            response.code = 200;
                                            
                                            res.json(response);
                                        }     
                                    });
                                        console.log('done');
                                    });
                                }
                                else
                                {
                                    response.data = user;
                                    response.message = "Success";
                                    response.code = 200;
                                            
                                    res.json(response);
                                }
                                
                            }
                        });
                    }
                });
            }
            else
            {
                fullUrl = req.protocol + '://' + req.get('host');
                download(req.body.pictureUrl, exuser[0]._doc._id, function(){
                        User.findById(exuser[0]._doc._id, function(err, p) {
                            if (!p)
                                console.log("Couldnt Updated");
                            else {
                                if(p._doc.isDeleted == true)
                                {
                                   response.message = "User Has been deleted";
                                   response.code = 400;                       
                                   res.json(response);
                                }
                                else
                                {
                                    response.data = p._doc;
                                    response.message = "Success: :Login";
                                    response.code = 200;
                                                        
                                    res.json(response);
                                }
                            }     
                        });
                            console.log('done');
                        });
            }
        }
    });
});
getAllUsersRoute.get(function (req, res) {
    // Create a new instance of the Beer model
    var response = new Response();
    var userDto = new UserDto();
    var resultArray = [];
    // Save the beer and check for errors
    
    User.find({}, null, { sort: { '_id': -1 } }, function (err, questions) {
        if (err)
        {
            res.send(err);
        }
        else
        {
            for(var i=0; i<questions.length; i++)
            {
                if(questions[i].channel != "admin")
                {
                    if(questions[i].isDeleted != true)
                    {
                        userDto = new UserDto();
                        userDto.Id = questions[i]._id;
                        userDto.firstName = questions[i].firstName;
                        userDto.lastName = questions[i].lastName;
                        userDto.email = questions[i].email;
                        userDto.channel = questions[i].channel;
                        userDto.pictureUrl = questions[i].pictureUrl;
                        userDto.latLocation = questions[i].latLocation;
                        userDto.age = questions[i].age;
                        userDto.gender = questions[i].gender;
                        userDto.deviceInfo = questions[i].deviceInfo;
                        userDto.createdOnUTC = questions[i].createdOnUTC;
                        userDto.updatedOnUTC = questions[i].updatedOnUTC;
                        resultArray.push(userDto);
                    }
                }
            }
            response.message = "Success";
            response.code = 200;
            response.data = resultArray;
            res.json(response);
        }
    });
});

var download = function(uri, filename, callback){
    console.log("uri:" + uri);
  request.head(uri, function(err, res, body){
    console.log('content-type:', res.headers['content-type']);
    console.log('content-length:', res.headers['content-length']);
    var extension = "";

    if(res.headers['content-type'] == 'image/jpeg')
    {
        extension = ".jpg";
    }
    else if(res.headers['content-type'] == 'image/png')
    {
        extension = ".png";
    }
    var imageName = uuid.v4() + extension;
    console.log(imageName);
    User.findById(filename, function(err, p) {
        if (!p)
            console.log("Couldnt Updated");
        else {
            // do your updates here
            p.pictureUrl = fullUrl+ "/images/" + imageName;

            p.save(function(err) {
                if (err)
                  console.log('error')
                else
                    console.log('success')
                });
            }   
        });
    request(uri).pipe(fs.createWriteStream("./../public/images/" + imageName)).on('close', callback);
  });
};

module.exports = router;