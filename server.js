const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");

const formatMessage = require("./utils/messages.utils");
const {
  getCurrentUser,
  userJoin,
  userleaves,
  getRoomUsers,
} = require("./utils/users.utils");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

//set static folder
app.use(express.static(path.join(__dirname, "src")));

const botName = "ChatLite Bot";

//Run when a client connects
io.on("connection", (socket) => {
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);
    //Welcome current user
    socket.emit("message", formatMessage(botName, `Welcome ${username}`));

    //broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(botName, `${username} has joined the chat`)
      );

    //send users and room info
    io.to(user.room).emit("roomusers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  //listen for chatmessage
  socket.on("chat-message", (message) => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit("message", formatMessage(user.username, message));
  });

  //run when client disconnects
  socket.on("disconnect", () => {
    const user = userleaves(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(botName, `${user.username} has left the chat`)
      );

      //send users and room info
      io.to(user.room).emit("roomusers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`App is working well on port ${PORT}`);
});
