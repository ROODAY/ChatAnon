var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require("socket.io")(http);
var storage = require('node-persist');
var data = {
	users: [], //two dimensional array, first is id, second is color
	totalUsers: 0
}

storage.initSync();
storage.setItem('data', data);

app.use(express.static(__dirname + '/public'));
app.get('/', function(req, res){
  res.sendfile(__dirname + '/index.html');
});

io.on('connection', function(socket){
	console.log('a user connected');
	data = storage.getItem('data');
	data.users += 1;
	storage.setItem('data', data);
	socket.emit('con', data.users);
	socket.emit('chat message', "A user connected.");
	socket.on('disconnect',function(){
		data.users -= 1;
		storage.setItem('data', data);
		socket.emit('con', data.users);
		console.log('a user disconnected');
		socket.emit('chat message', "A user disconnected.");
	});
	socket.on('chat message', function(msg){
		io.emit('chat message', msg);
	});
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});