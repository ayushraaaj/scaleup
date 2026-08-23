import "../models/booking.model";
import cron, { ScheduledTask } from "node-cron";
import { Session } from "../models/session.model";
import { publisher } from "../config/pubsub";

let sessionCleanupJob: ScheduledTask | null = null;

export const startSessionCleanup = () => {
  if (sessionCleanupJob) {
    return;
  }

  sessionCleanupJob = cron.schedule("* * * * *", async () => {
    try {
      console.log("Session cleanup cron is running...");

      const sessions = await Session.find({
        sessionStatus: {
          $in: ["ongoing", "end_requested"],
        },
      }).populate("bookingId", "date endTime");

      for (const session of sessions) {
        const booking = session.bookingId as any;

        const bookingEndTime = new Date(
          `${booking.date}T${booking.endTime}:00`,
        );

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

          // const io = getIO();

          // io.to(booking._id.toString()).emit("call-ended");

          await publisher.publish(
            "session-ended",
            JSON.stringify({
              bookingId: booking._id.toString(),
            }),
          );
        } else {
          console.log("Session Still Running");
        }
      }
    } catch (error) {
      console.log("Session cleanup failed: ", error);
    }
  });

  console.log("Session cleanup cron started");
};

export const stopSessionCleanup = () => {
  if (!sessionCleanupJob) {
    return;
  }

  sessionCleanupJob.stop();
  sessionCleanupJob = null;

  console.log("Session cleanup cron stopped");
};
