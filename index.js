var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require("socket.io")(http);
var users = 0;

app.use(express.static(__dirname + '/public'));
app.get('/', function(req, res){
  res.sendfile(__dirname + '/index.html');
});

io.on('connection', function(socket){
	console.log('a user connected');
	users += 1;
	socket.emit('con', users);
	socket.emit('chat message', "A user connected.");
	socket.on('disconnect',function(){
		users -= 1;
		socket.emit('con', users);
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