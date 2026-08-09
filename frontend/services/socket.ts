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
