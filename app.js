// Dependency
var express  = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var app      = express();
var server   = require('http').Server(app);
var io       = require('socket.io')(server);

// Config
app.use(bodyParser.urlencoded({ extended: true }));
app.use(function(req,res,next){
    req.io = io;
    next();
});

// Static files path
app.use(express.static(__dirname + '/public'));