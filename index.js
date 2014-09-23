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
	var newColor = '#'+Math.floor((Math.random()*3355443) + 13421772).toString(16);
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
	data.users[socket.id] = '#'+Math.floor((Math.random()*3355443) + 13421772).toString(16);
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