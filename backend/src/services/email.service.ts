import { BrevoClient } from "@getbrevo/brevo";
import { BREVO_API_KEY, EMAIL_FROM, EMAIL_FROM_NAME } from "../config/env";
import { render } from "react-email";
import BookingConfirmation from "../emails/BookingConfirmation";
import React from "react";

export const brevo = new BrevoClient({
  apiKey: BREVO_API_KEY,
});

export const sendBookingConfirmationEmail = async ({
  recipientEmail,
  recipientName,
  mentorName,
}: {
  recipientEmail: string;
  recipientName: string;
  mentorName: string;
}) => {
  const emailHtml = await render(
    React.createElement(BookingConfirmation, {
      username: recipientName,
      mentorName,
    }),
  );

  await brevo.transactionalEmails.sendTransacEmail({
    sender: {
      name: EMAIL_FROM_NAME,
      email: EMAIL_FROM,
    },
    to: [
      {
        name: recipientName,
        email: recipientEmail,
      },
    ],
    subject: "Booking Confirmed",
    htmlContent: emailHtml,
  });
};
