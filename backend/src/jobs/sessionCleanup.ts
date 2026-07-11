import cron from "node-cron";
import { Session } from "../models/session.model";
import { getIO } from "../services/socket";

export const startSessionCleanup = () => {
  cron.schedule("* * * * *", async () => {
    console.log("Session cleanup cron is running...");

    const sessions = await Session.find({
      sessionStatus: {
        $in: ["ongoing", "end_requested"],
      },
    }).populate("bookingId", "date endTime");

    for (const session of sessions) {
      const booking = session.bookingId as any;

      const bookingEndTime = new Date(`${booking.date}T${booking.endTime}:00`);

      const currentTime = new Date();

      if (currentTime >= bookingEndTime) {
        await Session.findByIdAndUpdate(session._id, {
          $set: {
            sessionStatus: "completed",
            completedAt: new Date(),
            completionReason: "scheduled_end",
          },
        });

        console.log("Session Expired");

        const io = getIO();

        io.to(booking._id.toString()).emit("call-ended");
      } else {
        console.log("Session Still Running");
      }
    }
  });
};
