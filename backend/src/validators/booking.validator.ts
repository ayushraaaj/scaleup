import { body, param } from "express-validator";

export const createBookingValidator = () => {
  return [
    param("mentorId").isMongoId().withMessage("Invalid mentor ID"),

    body("sessionType")
      .isIn(["audio", "video"])
      .withMessage("Session type must be 'audio' or 'video'"),

    body("startTime").notEmpty().withMessage("Start time is required"),
  ];
};

export const detailedBookingValidator = () => {
  return [param("bookingId").isMongoId().withMessage("Invalid booking ID")];
};
