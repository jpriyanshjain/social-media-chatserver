const dotenv = require("dotenv");
dotenv.config();

const io = require("socket.io")(process.env.PORT, {
  cors: {
    origin: process.env.URL,
  },
});

let activeUsers = [];

io.on("connection", (socket) => {
  // add new User
  socket.on("new-user-add", (newUserId) => {
    if (!activeUsers.some((user) => user.userId === newUserId)) {
      activeUsers.push({
        userId: newUserId,
        socketId: socket.id,
      });
      io.emit("get-users", activeUsers);
    }
  });

  //send message
  socket.on("send-message", (data) => {
    const { receiverId } = data;
    data.seen = false;
    const user = activeUsers.find((user) => user.userId === receiverId);
    if (user) {
      io.to(user.socketId).emit("recieve-message", data);
    }
  });

  //notification
  socket.on("send-notification", (data) => {
    const { userId } = data;
    const user = activeUsers.find((user) => user.userId === userId);

    if (user) {
      io.to(user.socketId).emit("receive-notification", data);
    }
  });

  socket.on("disconnect", () => {
    activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
    io.emit("get-users", activeUsers);
  });
});
