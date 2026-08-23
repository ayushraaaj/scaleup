import dotenv from "dotenv";
import app from "./app";
import { PORT } from "./config/env";
import connectDB from "./db/db";
import http from "http";
import { initializeSocket } from "./services/socket";
import { startSubscribers } from "./subscribers";

dotenv.config({ path: "./.env" });

connectDB();

const server = http.createServer(app);

initializeSocket(server);

startSubscribers();

server.listen(PORT || 8001, () => {
  console.log(`Server is running on Port: ${PORT || 8001}`);
});

// app.listen(PORT || 8001, () => {
//   console.log(`Server is running on Port: ${PORT || 8001}`);
// });
