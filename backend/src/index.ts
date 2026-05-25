import dotenv from "dotenv";
import app from "./app";
import { CLIENT_URL, PORT } from "./config/env";
import connectDB from "./db/db";
import http from "http";
import { Server } from "socket.io";
import { Message } from "./models/message.model";

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

  socket.on("join-room", (bookingId) => {
    socket.join(bookingId);

    console.log(`Socket ${socket.id} joined room ${bookingId}`);
  });

  socket.on("typing", ({ bookingId, name }) => {
    socket.to(bookingId).emit("user-typing", name);
  });

  socket.on("send-message", (message) => {
    const bookingId = message.bookingId;

    io.to(bookingId).emit("receive-message", message);
  });

  // socket.on("message-delivered", async ({ messageId }) => {
  //   const updatedMessage = await Message.findByIdAndUpdate(
  //     messageId,
  //     {
  //       delivered: true,
  //     },
  //     { new: true },
  //   ).populate("senderId", "fullname username");

  //   io.emit("message-delivered-updated", updatedMessage);
  // });

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
