import { Queue } from "bullmq";
import { redis } from "../config/redis";

export const emailQueue = new Queue("email", {
  connection: redis,
});

export const addEmailJob = async ({
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
}) => {
  await emailQueue.add(
    "booking-confirmation",
    {
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
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
    },
  );

  console.log("Email job added");
};
