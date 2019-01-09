var app = require("express")();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var _ = require("lodash");

let PORT = 3000;
if (process.env.PORT) {
  PORT = process.env.PORT;
}

var users = [];

console.log("Startar social robot signaling server!");
app.get("/", function(req, res) {
  res.sendfile("index.html");
});

io.on("connection", function(socket) {
  console.log("socket connection established. id: " + socket.id);
    // if this socket is already logged in,
    // send a failed login message
  // if (_.findIndex(users, {socket: socket.id}) !== -1) {
  //   socket.emit("login_error", "You are already connected.");
  // }
  // socket.on("login", function(data) {
  //   // if this socket is already logged in,
  //   // send a failed login message
  //   if (
  //     _.findIndex(users, {
  //       socket: socket.id
  //     }) !== -1
  //   ) {
  //     socket.emit("login_error", "You are already connected.");
  //   }

  //   users.push({ id: data.id, socket: socket.id });
  //   console.log("socket with id " + socket.id + " logged in");
  // });

  socket.on("join", data => {
    console.log(`socket ${socket.id} wants to join room ${data}`);
    
    socket.join(data);
    let room = data;

    //TODO: create some logic to prevent more than two clients in a room
    // if(Object.keys(socket.rooms[room].sockets).length > 2){
    //   socket.leave(room);
    //   console.log(`socket ${socket.id} couldn't join room ${room} since it wa full`);
    //   socket.emit('error', 'that room seems to be full');
      
    //   return;
    // }

    console.log(`socket ${socket.id} is now joined to room ${data}`);
    console.log(`socket has following rooms:`);
    console.log(socket.rooms);

    // Handle RTC signaling transparently. Just pass on the message to the other clients
    socket.on("signal", data => {
      console.log("received signaling message from socket " + socket.id);
      console.log(data);
      console.log(`propagating signaling message to room: ${room}`);
      socket.broadcast.to(room).emit("signal", data);
    });

    // socket.on("sendMessage", function(message) {
    //   if (!message.peer_id) {
    //     console.log("no peer_id provided!!! Saay whaaaaaaa?!");
    //     return;
    //   }
    //   var peer_id = Number(message.peer_id);
    //   var contact = _.find(users, { id: peer_id });
    //   if (!contact) {
    //     console.log("no such peer found in the user list!");
    //     return;
    //   }
    //   console.log(
    //     "sending message of type " +
    //       message.type +
    //       " from " +
    //       message.id +
    //       " to " +
    //       message.peer_id
    //   );
    //   if (message.data) {
    //     console.log("data:" + JSON.stringify(message.data));
    //   }
    //   console.log("with socketId's: " + socket.id + ", " + contact.socket);
    //   io.to(contact.socket).emit("messageReceived", message);
    // });

    socket.on("robotControl", msg => {
      console.log(`propagating robotControl message to room: ${room}`);
      socket.broadcast.to(room).emit("robotControl", msg);
      // console.log(msg);
    });
  })

  socket.on("disconnect", () => {
    console.log("socket disconnected. id: " + socket.id);
    // _.remove(users, function(user) {
    //   return user.socket == socket.id;
    // });
  });
});

http.listen(PORT, function() {
  var host = http.address().address;
  var port = http.address().port;

  console.log("Example app listening at http://%s:%s", host, port);
  // console.log('listening on *:' + PORT);
});
