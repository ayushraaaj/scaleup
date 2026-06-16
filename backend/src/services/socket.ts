import { Server } from "socket.io";
import { CLIENT_URL } from "../config/env";

export const initializeSocket = (server: any) => {
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

    socket.on("disconnect", () => {
      console.log("Socket disconnected: ", socket.id);
    });

    socket.on("offer", ({ id, offer, fullname }) => {
      socket.to(id).emit("receive-offer", { offer, fullname });

      // console.log("Offer created on backend");
      // console.log("Forwarding offer to room:", id);
    });

    socket.on("answer", ({ id, answer }) => {
      socket.to(id).emit("receive-answer", answer);
    });

    socket.on("ice-candidate", ({ id, candidate }) => {
      socket.to(id).emit("receive-ice-candidate", candidate);
    });

    socket.on("end-call", ({ id }) => {
      socket.to(id).emit("call-ended");
    });

    socket.on("call-request", ({ id }) => {
      socket.to(id).emit("incoming-call");
    });

    socket.on("user-joined-call", ({ id, fullname }) => {
      socket.to(id).emit("user-joined-call", { fullname });
    });

    socket.on("call-declined", ({ id }) => {
      socket.to(id).emit("call-declined");
    });

    socket.on("camera-status", ({ id, enabled }) => {
      socket.to(id).emit("remote-camera-status", { enabled });
    });

    socket.on("mic-status", ({ id, enabled }) => {
      socket.to(id).emit("remote-mic-status", { enabled });
    });

    // socket.on("screen-shaare-status", ({ id, enabled }) => {
    //   socket.to(id).emit("screen-share-status", { enabled });
    // });
  });
};
