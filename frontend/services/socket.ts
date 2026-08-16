import { getAccessToken } from "@/utils/auth";
import { io } from "socket.io-client";

export const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL, {
  withCredentials: true,
  autoConnect: false,
});

export const connectSocket = () => {
  socket.auth = {
    token: getAccessToken(),
  };

  socket.connect();
};

socket.on("connect", () => {
  console.log("SOCKET CONNECTED:", socket.id);
});

socket.on("disconnect", (reason) => {
  console.log("SOCKET DISCONNECTED:", reason);
});

socket.on("connect_error", (error) => {
  console.log("SOCKET CONNECT ERROR:", error.message);
});
