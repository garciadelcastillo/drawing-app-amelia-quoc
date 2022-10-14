
// JL: Adapted your code to work as a single project locally or in Glitch
// Inspired by https://glitch.com/edit/#!/oceanic-farm

const express = require("express");
const app = express();
const server = require("http").createServer(app);

app.use(express.static("public"));

// JL: USE THESE SETTINGS IF RUNNING THE SERVER LOCALLY
const SERVER_PORT = 5500;
const SERVER_CONFIG = {};

// // JL: USE THESE SETTINGS IF RUNNING THE SERVER FROM GLITCH
// const SERVER_PORT = process.env.PORT;
// const SERVER_CONFIG = {
//   // JL: we need to add this to make sure we don't have 
//   // CORS problems inside the glitch server
//   cors: { origin: ["https://glitch.me", "https://cdpn.io"] }
// };


server.listen(SERVER_PORT, () => {
  console.log("server listening on port " + SERVER_PORT);
});

const io = require("socket.io")(server, SERVER_CONFIG);

io.on('connection', newConnection);

const userID = [];
function newConnection(socket) {
  console.log('new user: ' + socket.id);

  userID.push(socket.id);
  console.log(userID);

  socket.on('mouse', mouseMsg);

  function mouseMsg(data) {
    socket.broadcast.emit('mouse', data);
    console.log(data);
  }

  socket.on('detections', detectionMsg);

  function detectionMsg(data) {
    socket.broadcast.emit('detections', data);
    console.log(data);
  }

  socket.on('disconnect', () => {
    console.log('user disconnected: ' + socket.id);
    index = userID.indexOf(socket.id);
    if (index > -1) {
      userID.splice(index, 1);
    }
  });
}






















// const now = () => new Date().toJSON().replace("T", " ").slice(0, 16);

// const usersBySocketId = {};
// const usersByName = {};
// const messages = [];

// io.on("connection", socket => {
//   usersBySocketId[socket.id] = {};

//   socket.on("disconnect", () => {
//     const username = usersBySocketId[socket.id].username;

//     if (username) {
//       const socketSet = usersByName[username];
//       socketSet.delete(socket.id);

//       if (!socketSet.size) {
//         delete usersByName[username];
//       }

//       delete usersBySocketId[socket.id];
//       io.emit("users", { users: Object.keys(usersByName) });
//     }
//   });

//   socket.on("chat message", msg => {
//     const message = {
//       text: msg,
//       time: now(),
//       username: usersBySocketId[socket.id].username
//     };

//     if (messages.push(message) > 3000) {
//       messages.shift();
//     }

//     io.emit("chat message", message);
//   });

//   socket.on("set username", (username, cb) => {
//     if (username in usersByName) {
//       usersByName[username].add(socket.id);
//     }

//     usersByName[username] = new Set([socket.id]);
//     usersBySocketId[socket.id].username = username;
//     io.emit("users", { users: Object.keys(usersByName) });

//     if (cb) {
//       cb({ messages });
//     }
//   });
// });