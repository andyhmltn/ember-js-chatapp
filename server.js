// Require dependencies
var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io').listen(server);
if (process.env.REDISTOGO_URL) {
  var rtg   = require("url").parse(process.env.REDISTOGO_URL);
  var redis = require("redis").createClient(rtg.port, rtg.hostname);

  redis.auth(rtg.auth.split(":")[1]);
} else {
  var redis = require("redis").createClient();
}

// assuming io is the Socket.IO server object
io.configure(function () { 
  io.set("transports", ["xhr-polling"]); 
  io.set("polling duration", 10); 
});

var storeMessage = function(name, data) {
  var message = JSON.stringify({name: name, data: data});
  redis.lpush("messages", message, function(err, response) {
    redis.ltrim("messages", 0, 10);
  });
};

// Listen for connections
io.sockets.on('connection', function(socket) {
  
  socket.on('join', function(name) {
    console.log('name');
    redis.lrange("messages", 0, -1, function(err, messages){
      messages = messages.reverse();
      messages.forEach(function(message) {
        message = JSON.parse(message);

        var return_data = {name: message.name, message: message.data};

        socket.broadcast.emit('messages', JSON.stringify(return_data));
        socket.emit('messages', JSON.stringify(return_data));
      });
    });

    socket.set('nickname', name);
    socket.broadcast.emit("add chatter", name);
    socket.emit("add chatter", name);
    redis.smembers('names', function(err, names) {
      names.forEach(function(name) {
        socket.emit('add chatter', name);
      });
    });
    redis.sadd("chatters", name);
  });

  // Receive messages from the client and broadcast them to everyone
  socket.on('messages', function(data) {
    data = data.replace(/\n/g, '<br />');
    socket.get('nickname', function(err, name) {
      if (name !== null) {
        var return_data = {name: name, message: data};
        console.log(return_data);
        socket.broadcast.emit('messages', JSON.stringify(return_data));
        socket.emit('messages', JSON.stringify(return_data));

        storeMessage(name, data);
      }
    });
  });

});

// Without this line, the CSS will not work
app.use('/public', express.static(__dirname + '/public'));

// Route index.html to the root path
app.get('/', function(request, response) {
	response.sendfile(__dirname + "/public/index.html");
});

// Listen for GET requests to the server
var port = process.env.PORT || 5000;
server.listen(port, function() {
  console.log("Listening on port " + port);
});