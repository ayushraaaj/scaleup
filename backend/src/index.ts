import dotenv from "dotenv";
import app from "./app";
import { CLIENT_URL, PORT } from "./config/env";
import connectDB from "./db/db";
import http from "http";
import { Server } from "socket.io";
import { initializeSocket } from "./services/socket";

dotenv.config({ path: "./.env" });

connectDB();

const server = http.createServer(app);

initializeSocket(server);

server.listen(PORT || 8001, () => {
  console.log(`Server is running on Port: ${PORT || 8001}`);
});

// app.listen(PORT || 8001, () => {
//   console.log(`Server is running on Port: ${PORT || 8001}`);
// });
