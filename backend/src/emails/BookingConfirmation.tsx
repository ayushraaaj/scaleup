import React from "react";
import {
  Body,
  Button,
  Container,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "react-email";

interface BookingConfirmationProps {
  recipientFullname: string;
  mentorFullname: string;
  mentorUsername: string;
  date: string;
  startTime: string;
  endTime: string;
  sessionType: string;
  totalPrice: number;
  bookingUrl: string;
}

const BookingConfirmation = (props: BookingConfirmationProps) => {
  const {
    recipientFullname,
    mentorUsername,
    mentorFullname,
    date,
    startTime,
    endTime,
    sessionType,
    totalPrice,
    bookingUrl,
  } = props;

  // return (
  //   <Html>
  //     <Preview>Your consultation has been booked</Preview>

  //     <Body>
  //       <Container>
  //         <Heading>Booking Confirmed</Heading>

  //         <Text>
  //           Hi {recipientFullname}(@{recipientUsername}),
  //         </Text>

  //         <Text>
  //           Your consultation with {mentorFullname}(@{mentorUsername}) has been
  //           successfully booked.
  //         </Text>
  //       </Container>
  //     </Body>
  //   </Html>
  // );

  return (
    <Html>
      <Preview>Your ScaleUp consultation is confirmed</Preview>

      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Brand */}
          <Text style={styles.logo}>SCALEUP</Text>

          {/* Heading */}
          <Heading style={styles.heading}>Booking Confirmed</Heading>

          <Text style={styles.text}>Hi {recipientFullname},</Text>

          <Text style={styles.text}>
            Your consultation has been successfully booked. Here are your
            booking details:
          </Text>

          {/* Mentor */}
          <Section style={styles.card}>
            <Text style={styles.cardTitle}>MENTOR</Text>

            <Text style={styles.primaryText}>{mentorFullname}</Text>

            <Text style={styles.secondaryText}>@{mentorUsername}</Text>
          </Section>

          {/* Booking Details */}
          <Section style={styles.card}>
            <Text style={styles.cardTitle}>BOOKING DETAILS</Text>

            <Text style={styles.detail}>
              <strong>Date:</strong> {date}
            </Text>

            <Text style={styles.detail}>
              <strong>Time:</strong> {startTime} – {endTime}
            </Text>

            <Text style={styles.detail}>
              <strong>Session:</strong>{" "}
              {sessionType === "video"
                ? "Video Consultation"
                : "Audio Consultation"}
            </Text>

            <Text style={styles.detail}>
              <strong>Price:</strong> ₹{totalPrice}
            </Text>
          </Section>

          {/* CTA */}
          <Section style={styles.buttonContainer}>
            <Button href={bookingUrl} style={styles.button}>
              View Booking
            </Button>
          </Section>

          <Text style={styles.footerText}>
            You can view your booking details and access your consultation from
            your ScaleUp account.
          </Text>

          <Text style={styles.signature}>
            Thanks,
            <br />
            ScaleUp
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

const styles = {
  body: {
    backgroundColor: "#f4f4f5",
    fontFamily: "Arial, Helvetica, sans-serif",
    padding: "40px 0",
  },

  container: {
    backgroundColor: "#ffffff",
    margin: "0 auto",
    padding: "32px",
    maxWidth: "600px",
    borderRadius: "8px",
  },

  logo: {
    fontSize: "20px",
    fontWeight: "700",
    letterSpacing: "2px",
    margin: "0 0 32px",
  },

  heading: {
    fontSize: "28px",
    lineHeight: "36px",
    margin: "0 0 24px",
  },

  text: {
    fontSize: "16px",
    lineHeight: "24px",
    color: "#27272a",
  },

  card: {
    backgroundColor: "#f8fafc",
    borderRadius: "8px",
    padding: "20px",
    marginTop: "20px",
  },

  cardTitle: {
    fontSize: "12px",
    fontWeight: "700",
    letterSpacing: "1px",
    color: "#71717a",
    margin: "0 0 12px",
  },

  primaryText: {
    fontSize: "17px",
    fontWeight: "600",
    margin: "0 0 4px",
  },

  secondaryText: {
    fontSize: "14px",
    color: "#71717a",
    margin: "0",
  },

  detail: {
    fontSize: "15px",
    lineHeight: "22px",
    color: "#27272a",
  },

  buttonContainer: {
    textAlign: "center" as const,
    marginTop: "28px",
  },

  button: {
    backgroundColor: "#18181b",
    color: "#ffffff",
    padding: "12px 24px",
    borderRadius: "6px",
    textDecoration: "none",
    fontWeight: "600",
  },

  footerText: {
    fontSize: "14px",
    lineHeight: "22px",
    color: "#71717a",
    marginTop: "32px",
  },

  signature: {
    fontSize: "14px",
    lineHeight: "22px",
    color: "#71717a",
    marginTop: "24px",
  },
};

export default BookingConfirmation;
