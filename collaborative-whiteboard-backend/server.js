const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());

const sessions = {}; // Store session data: users and canvas

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinSession", ({ sessionId, username }) => {
    if (!sessions[sessionId]) {
      sessions[sessionId] = { users: [], canvas: "" };
    }

    sessions[sessionId].users.push(username);

    socket.join(sessionId);

    io.to(sessionId).emit("sessionUpdated", {
      connectedUsers: sessions[sessionId].users.length,
      users: sessions[sessionId].users,
    });

    socket.emit("loadCanvas", sessions[sessionId].canvas);
  });

  socket.on("updateCanvas", ({ sessionId, data }) => {
    if (sessions[sessionId]) {
      sessions[sessionId].canvas = data;
      socket.to(sessionId).emit("updateCanvas", data);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    Object.keys(sessions).forEach((sessionId) => {
      sessions[sessionId].users = sessions[sessionId].users.filter(
        (user) => user !== socket.id
      );
      io.to(sessionId).emit("sessionUpdated", {
        connectedUsers: sessions[sessionId].users.length,
        users: sessions[sessionId].users,
      });
    });
  });
});

const PORT = 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));



// io.on("connection", (socket) => {
//   console.log("A user connected");

//   socket.on("joinSession", async ({ sessionId, userId }) => {
//     socket.join(sessionId);

//     const session = await Session.findOne({ sessionId });
//     if (session) {
//       session.users.push(userId);
//       await session.save();
//     }

//     socket.to(sessionId).emit("userJoined", { userId });
//   });

// socket.on("drawing", async ({ sessionId, drawingData }) => {
//   io.to(sessionId).emit("drawing", drawingData);

//   const session = await Session.findOne({ sessionId });
//   if (session) {
//     session.canvasState = drawingData;
//     await session.save();
//   }
// });

//   socket.on("disconnect", () => {
//     console.log("A user disconnected");
//   });
// });

// let connectedUsers = 0;
// let canvasData = ""; // Default canvas data (empty)

// io.on("connection", (socket) => {
//   connectedUsers++;

//   io.emit("joinSession", { connectedUsers });

//   // Send current canvas data to the new user
//   socket.emit("loadCanvas", canvasData);

//   // Listen for canvas updates
//   socket.on("updateCanvas", (data) => {
//     canvasData = data; // Update the server-side canvas data
//     socket.emit("updateCanvas", data); // Broadcast changes to all other users
//   });

//   socket.on("disconnect", () => {
//     connectedUsers--;

//     io.emit("joinSession", { connectedUsers });
//   });
// });



