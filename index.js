var express = require('express');
var app = express();
var markdown = require('marked');
var http = require('http').Server(app);
var io = require("socket.io")(http);
var storage = require('node-persist');
var util = require("util");
var chatlog = {
    "ChatAnon": []
};
var connectclients = [];

Colors = {};
Colors.names = {
    red: "#F44336",
    purple: "#9C27B0",
    deeppurple: "#673AB7",
    indigo: "#3F51B5",
    blue: "#2196F3",
    teal: "#009688",
    green: "#4CAF50",
    lightgreen: "#8BC34A",
    amber: "#FFC107",
    orange: "#FF9800",
    deeporange: "#FF5722",
    brown: "#795548",
    bluegrey: "#607D8B"
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
storage.setItem('chatlog', chatlog);

app.use(express.static(__dirname + '/public'));
app.use(function(req, res, next){
  res.sendFile(__dirname + "/public/404.html");
});
app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
    console.log('User Connected. ID: ' + socket.id);
    connectclients.push(socket.id); 
    socket.join("ChatAnon");
    var roomList = [];
    Object.keys(io.sockets.adapter.rooms).forEach(function(room) {
        var isclient = false;
        connectclients.forEach(function(client){
            if (room === client) {
                isclient = true;
            }
        });
        if (isclient === false) {
            roomList.push(room);
        }
    });
    socket.emit("roomList", roomList);
    socket.emit('localID', socket.id, Colors.random());
    socket.emit('firstjoin', chatlog.ChatAnon);
    io.sockets.in("ChatAnon").emit('ding', true);
    io.sockets.emit('console chat message', "A user connected.");
    io.sockets.in("ChatAnon").emit("updateClientNumber", Object.keys(io.sockets.adapter.rooms["ChatAnon"]).length);
    io.sockets.in("ChatAnon").emit('console chat message', "A user entered the room.");

    socket.on("joinRoom", function(curRoom, nextRoom){
        socket.leave(curRoom);
        socket.join(nextRoom);
        var roomList = [];
        Object.keys(io.sockets.adapter.rooms).forEach(function(room) {
            var isclient = false;
            connectclients.forEach(function(client){
                if (room === client) {
                    isclient = true;
                }
            });
            if (isclient === false) {
                roomList.push(room);
            }
        });
        io.sockets.emit("roomList", roomList);
        if (!(nextRoom in chatlog)) {
            chatlog[nextRoom] = [];
        } else {
            socket.emit("firstjoin", chatlog[nextRoom]);
        }
        if (io.sockets.adapter.rooms[curRoom]) {
            io.sockets.in(curRoom).emit("updateClientNumber", Object.keys(io.sockets.adapter.rooms[curRoom]).length);
            io.sockets.in(curRoom).emit('ding', true);
            io.sockets.in(curRoom).emit('console chat message', "A user left the room.");
        }
        io.sockets.in(nextRoom).emit("updateClientNumber", Object.keys(io.sockets.adapter.rooms[nextRoom]).length);
        io.sockets.in(nextRoom).emit('ding', true);
        io.sockets.in(nextRoom).emit('console chat message', "A user entered the room.");
    });

    socket.on('disconnect',function(){
        io.sockets.emit('console chat message', "A user disconnected.");
    });

	socket.on('chat message', function(text, color, room){
		io.sockets.in(room).emit('chat message', text, color);
	});

    socket.on('pushli', function(text, color, room){
        if (text != undefined && text != null && text != "" && color != undefined && color != null && color != "") {
            if (chatlog[room].length < 51) {
                var textobject = [text, color]
                chatlog[room].push(textobject);
            } else {
                var textobject = [text, color]
                chatlog[room].splice(0,1);
                chatlog[room].push(textobject);
            }
            storage.setItem('chatlog', chatlog);
        } 
    });
});


http.listen((process.env.PORT || 3000), function(){
  console.log('listening on *:3000');
});

setInterval(function(){
    var roomList = [];
    Object.keys(io.sockets.adapter.rooms).forEach(function(room) {
        var isclient = false;
        connectclients.forEach(function(client){
            if (room === client) {
                isclient = true;
            }
        });
        if (isclient === false) {
            roomList.push(room);
        }
    });
    io.sockets.emit("roomList", roomList);
}, 1000);