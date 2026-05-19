import { body, param } from "express-validator";

export const createMessageValidator = () => {
  return [
    param("bookingId").isMongoId().withMessage("Invalid Booking Id"),

    body("content").trim().notEmpty().withMessage("Message is required"),
  ];
};

export const showMessagesValidator = () => {
  return [param("bookingId").isMongoId().withMessage("Invalid Booking Id")];
};
