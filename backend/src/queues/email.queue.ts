import { Queue } from "bullmq";
import { redis } from "../config/redis";

export const emailQueue = new Queue("email", {
  connection: redis,
});

export const addEmailJob = async (
  eventId: string,
  {
    recipientId,
    recipientEmail,
    recipientUsername,
    recipientFullname,
    mentorUsername,
    mentorFullname,
    bookingId,
    date,
    startTime,
    endTime,
    sessionType,
    totalPrice,
  }: {
    recipientId: string;
    recipientEmail: string;
    recipientUsername: string;
    recipientFullname: string;
    mentorUsername: string;
    mentorFullname: string;
    bookingId: string;
    date: string;
    startTime: string;
    endTime: string;
    sessionType: string;
    totalPrice: number;
  },
) => {
  await emailQueue.add(
    "booking-confirmation",
    {
      outboxEventId: eventId,
      recipientId,
      recipientEmail,
      recipientUsername,
      recipientFullname,
      mentorUsername,
      mentorFullname,
      bookingId,
      date,
      startTime,
      endTime,
      sessionType,
      totalPrice,
    },
    {
      jobId: `outbox-${eventId}`,
      attempts: 3,
      backoff: {
        type: "custom",
      },
      removeOnFail: {
        age: 7 * 24 * 60 * 60,
      },
    },
  );

  console.log("Email job added");
};
