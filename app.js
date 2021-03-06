// Dependency
var express  = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var app      = express();
var server   = require('http').Server(app);
var io       = require('socket.io')(server);

// Config
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req,res,next)=>{
    req.io = io;
    next();
});

require('dotenv').config()

// Static files path
app.use(express.static(__dirname + '/public'));
// console.log(process.env.MONGO_URI);
// mongoose.connect(process.env.MONGO_URI);
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
  });

var schema = mongoose.Schema({name: String, desc:String});
var Vote = mongoose.model('Vote', schema);

// Render homepage.
app.get('/', function(req, res) {
    res.sendFile('index.html');
});

// Route for voting
app.post('/vote', function(req, res) {
    var field = [
        {
            name: req.body.name
        },
        {
            desc: req.body.name
        }
    ];

    var newVote = new Vote(field[0]);

    newVote.save(function(err, data) {
        console.log('Saved');
    });

    Vote.aggregate(

        [{ "$group": {
            "_id": "$name",
            "total_vote": { "$sum": 1 }
        }}],

        function(err, results) {
            if (err) throw err;
            console.log(results);
            req.io.sockets.emit('vote', results);
        }
        );

    res.send({'message': 'Successfully added.'});
});

app.get('/data', function(req, res) {
    Vote.find().exec(function(err, msgs) {
        res.json(msgs);
    });
});

/*
Socket.io Setting
*/
// Socket IO event handler
io.on('connection', function (socket) {

    Vote.aggregate(

        [{ "$group": {
            "_id": "$name",
            "total_vote": { "$sum": 1 }
        }}],

        function(err, results) {
            if (err) throw err;

            socket.emit('vote', results);
        }
        );

});

// Start
server.listen(3000);
console.log('Open http://localhost:3000');