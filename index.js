var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require("socket.io")(http);
var storage = require('node-persist');
var data = {
	users: {}, //two dimensional array, first is id, second is color
	totalUsers: 0
}
var oldMessages;

Colors = {};
Colors.names = {
    azure: "#f0ffff",
    blue: "#0000ff",
    brown: "#a52a2a",
    darkblue: "#00008b",
    darkcyan: "#008b8b",
    darkgreen: "#006400",
    darkkhaki: "#bdb76b",
    darkmagenta: "#8b008b",
    darkolivegreen: "#556b2f",
    darkorange: "#ff8c00",
    darkorchid: "#9932cc",
    darkred: "#8b0000",
    darksalmon: "#e9967a",
    darkviolet: "#9400d3",
    fuchsia: "#ff00ff",
    gold: "#ffd700",
    green: "#008000",
    indigo: "#4b0082",
    magenta: "#ff00ff",
    maroon: "#800000",
    navy: "#000080",
    olive: "#808000",
    orange: "#ffa500",
    purple: "#800080",
    violet: "#800080",
    red: "#ff0000"
};
Colors.random = function() {
    var result;
    var count = 0;
    for (var prop in this.names)
        if (Math.random() < 1/++count)
           result = prop;
    return result;
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
	data.users[socket.id] = Colors.names[Colors.random()];
	storage.setItem('data', data);
    io.emit('ding', true);
	io.emit('senddata', data);
	socket.emit('localID', socket.id);
	io.emit('chat message', "A user connected.");
	socket.on('disconnect',function(){
		data.totalUsers -= 1;
		storage.setItem('data', data);
		io.emit('senddata', data);
		console.log('a user disconnected');
		io.emit('chat message', "A user disconnected.");
	});
	socket.on('chat message', function(msg, id){
		io.emit('chat message', msg, id);
	});
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});