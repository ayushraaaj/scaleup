import { BrevoClient } from "@getbrevo/brevo";
import {
  BREVO_API_KEY,
  CLIENT_URL,
  EMAIL_FROM,
  EMAIL_FROM_NAME,
} from "../config/env";
import { render } from "react-email";
import BookingConfirmation from "../emails/BookingConfirmation";
import React from "react";

export const brevo = new BrevoClient({
  apiKey: BREVO_API_KEY,
});

export const sendBookingConfirmationEmail = async ({
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
  const bookingUrl = `${CLIENT_URL}/dashboard/my-bookings/${bookingId}`;

  const emailHtml = await render(
    React.createElement(BookingConfirmation, {
      recipientFullname,
      mentorUsername,
      mentorFullname,
      date,
      startTime,
      endTime,
      sessionType,
      totalPrice,
      bookingUrl,
    }),
  );

  await brevo.transactionalEmails.sendTransacEmail({
    sender: {
      name: EMAIL_FROM_NAME,
      email: EMAIL_FROM,
    },
    to: [
      {
        name: recipientFullname,
        email: recipientEmail,
      },
    ],
    subject: "Booking Confirmed",
    htmlContent: emailHtml,
  });
};
