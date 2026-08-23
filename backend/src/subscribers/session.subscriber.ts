import { subscriber } from "../config/pubsub";
import { getIO } from "../services/socket";

export const startSessionSubscriber = async () => {
  await subscriber.subscribe("session-ended");

  console.log("Subscribed to session-ended");

  subscriber.on("message", (channel, message) => {
    if (channel !== "session-ended") {
      return;
    }

    const { bookingId } = JSON.parse(message);

    const io = getIO();

    io.to(bookingId).emit("call-ended");

    console.log(`Session ended notification sent for booking ${bookingId}`);
  });
};
