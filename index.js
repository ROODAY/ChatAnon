var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require("socket.io")(http);
var storage = require('node-persist');
var data = {
	users: {}, //two dimensional array, first is id, second is color
	totalUsers: 0
}

var randomColor = new function(){
	function rgb(string){
		return string.match(/\w\w/g).map(function(b){return parseInt(b, 16)})
	}
	var rbg1 = rgb("#333333");
	var rgb2 = rgb("#CCCCCC");
	var rgb3 = [];
	for(var i=0; i<3; i++){
		rgb3 = rgb1[i]+Math.random()*(rgb2[i]-rgb1[i])|0;
	}
	var newColor = '#' + rgb3
		.map(function(n){return n.toString(16)})
		.map(function(s){return "00".slice(s.length)+s}).join('');
	return newColor;
};

storage.initSync();
storage.setItem('data', data);

app.use(express.static(__dirname + '/public'));
app.get('/', function(req, res){
  res.sendfile(__dirname + '/index.html');
});

io.on('connection', function(socket){
	console.log('a user connected');
	data = storage.getItem('data');
	data.totalUsers += 1;
	data.users[socket.id] = randomColor();
	storage.setItem('data', data);
	socket.emit('con', data.totalUsers);
	socket.emit('senddata', data);
	socket.emit('localID', socket.id);
	socket.emit('chat message', "A user connected.");
	socket.on('disconnect',function(){
		data.totalUsers -= 1;
		storage.setItem('data', data);
		socket.emit('con', data.totalUsers);
		console.log('a user disconnected');
		socket.emit('chat message', "A user disconnected.");
	});
	socket.on('chat message', function(msg, id){
		io.emit('chat message', msg, id);
	});
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});