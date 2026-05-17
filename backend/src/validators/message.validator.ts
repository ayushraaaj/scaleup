import { body, param } from "express-validator";

export const createMessageValidator = () => {
  return [
    param("bookingId").isMongoId().withMessage("Invalid Booking Id"),

    body("content")
      .trim()
      .notEmpty()
      .withMessage("Message is required")
      .bail()
      .isLength({ min: 5 })
      .withMessage("Message must be atleast 5 characters long"),
  ];
};

export const showMessagesValidator = () => {
  return [param("bookingId").isMongoId().withMessage("Invalid Booking Id")];
};
