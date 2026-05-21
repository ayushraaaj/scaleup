import dotenv from "dotenv";
import app from "./app";
import { CLIENT_URL, PORT } from "./config/env";
import connectDB from "./db/db";
import http from "http";
import { Server } from "socket.io";

dotenv.config({ path: "./.env" });

connectDB();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("Socket connected: ", socket.id);

  socket.on("send-message", (message) => {
    const bookingId = message.bookingId;

    io.to(bookingId).emit("receive-message", message);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected: ", socket.id);
  });
});

server.listen(PORT || 8001, () => {
  console.log(`Server is running on Port: ${PORT || 8001}`);
});

// app.listen(PORT || 8001, () => {
//   console.log(`Server is running on Port: ${PORT || 8001}`);
// });
