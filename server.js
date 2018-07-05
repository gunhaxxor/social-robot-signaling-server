var app = require("express")();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var _ = require("lodash");

let PORT = 3000;
if (process.env.PORT) {
  PORT = process.env.PORT;
}

var users = [];

console.log("Startar server.js");
app.get("/", function(req, res) {
  res.sendfile("index.html");
});

io.on("connection", function(socket) {
  socket.on("login", function(data) {
    // if this socket is already connected,
    // send a failed login message
    if (
      _.findIndex(users, {
        socket: socket.id
      }) !== -1
    ) {
      socket.emit("login_error", "You are already connected.");
    }

    users.push({ id: data.id, socket: socket.id });
    console.log("socket with id " + socket.id + " logged in");
  });

  socket.on("sendMessage", function(message) {
    if (!message.peer_id) {
      console.log("no peer_id provided!!! Saay whaaaaaaa?!");
      return;
    }
    var peer_id = Number(message.peer_id);
    var contact = _.find(users, { id: peer_id });
    if (!contact) {
      console.log("no such peer found in the user list!");
      return;
    }
    console.log(
      "sending message of type " +
        message.type +
        " from " +
        message.id +
        " to " +
        message.peer_id
    );
    if (message.data) {
      console.log("data:" + JSON.stringify(message.data));
    }
    console.log("with socketId's: " + socket.id + ", " + contact.socket);
    io.to(contact.socket).emit("messageReceived", message);
  });

  socket.on("disconnect", function() {
    _.remove(users, function(user) {
      return user.socket == socket.id;
    });
  });
});

http.listen(PORT, function() {
  var host = http.address().address;
  var port = http.address().port;

  console.log("Example app listening at http://%s:%s", host, port);
  // console.log('listening on *:' + PORT);
});
