import React from "react";
import { Body, Container, Heading, Html, Preview, Text } from "react-email";

interface BookingConfirmationProps {
  username: string;
  mentorName: string;
}

const BookingConfirmation = (props: BookingConfirmationProps) => {
  const { username, mentorName } = props;

  return (
    <Html>
      <Preview>Your consultation has been booked</Preview>

      <Body>
        <Container>
          <Heading>Booking Confirmed</Heading>

          <Text>Hi {username},</Text>

          <Text>
            Your consultation with {mentorName} has been successfully booked.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default BookingConfirmation;
