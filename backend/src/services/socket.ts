import { Server } from "socket.io";
import { CLIENT_URL } from "../config/env";
import { Session } from "../models/session.model";

let io: Server;

export const initializeSocket = (server: any) => {
  io = new Server(server, {
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

    socket.on("end-call", async ({ id, fullname }) => {
      await Session.findOneAndUpdate(
        { bookingId: id },
        {
          $set: {
            sessionStatus: "completed",
            completedAt: new Date(),
            completionReason: "mutual_agreement",
          },
          $unset: {
            endRequestedBy: "",
            endRequestedAt: "",
          },
        },
        { new: true },
      );

      // socket.to(id).emit("call-ended", { fullname });

      io.to(id).emit("call-ended");
    });

    socket.on("request-end-session", async ({ id, fullname, userId }) => {
      const session = await Session.findOneAndUpdate(
        { bookingId: id },
        {
          $set: {
            sessionStatus: "end_requested",
            endRequestedBy: userId,
            endRequestedAt: new Date(),
          },
        },
        { new: true },
      );

      console.log(session);

      socket.to(id).emit("end-session-requested", { fullname });
    });

    socket.on("continue-session", async ({ id, fullname, userId }) => {
      await Session.findOneAndUpdate(
        { bookingId: id },
        {
          $set: {
            sessionStatus: "ongoing",
          },
          $unset: {
            endRequestedBy: "",
            endRequestedAt: "",
          },
        },
        { new: true },
      );

      socket.to(id).emit("session-continued", { fullname });
    });

    socket.on("session-time-expired", async ({ id }) => {
      await Session.findOneAndUpdate(
        { bookingId: id },
        {
          $set: {
            sessiontatus: "completed",
            completedAt: new Date(),
            completionReason: "scheduled_end",
          },
        },
      );

      console.log("Session expired");

      const fullname = "Ayush";

      io.to(id).emit("call-ended");
    });

    socket.on("call-request", async ({ id }) => {
      await Session.findOneAndUpdate(
        { bookingId: id },
        {},
        { upsert: true, new: true },
      );

      socket.to(id).emit("incoming-call");
    });

    socket.on("user-joined-call", ({ id, fullname }) => {
      socket.to(id).emit("user-joined-call", { fullname });
    });

    socket.on("call-declined", ({ id, fullname }) => {
      socket.to(id).emit("call-declined", { fullname });
    });

    socket.on("camera-status", ({ id, enabled }) => {
      socket.to(id).emit("remote-camera-status", { enabled });
    });

    socket.on("mic-status", ({ id, enabled }) => {
      socket.to(id).emit("remote-mic-status", { enabled });
    });

    socket.on("screen-share-status", ({ id, enabled }) => {
      socket.to(id).emit("remote-screen-share-status", {
        enabled,
      });
    });

    socket.on("rejoin-call", ({ id, fullname }) => {
      socket.to(id).emit("participant-rejoined", { fullname });
    });
  });
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO has not been initialized");
  }

  return io;
};
