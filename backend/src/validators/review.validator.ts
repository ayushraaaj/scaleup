import { body, param } from "express-validator";

export const createReviewValidator = () => {
  return [
    body("bookingId")
      .trim()
      .notEmpty()
      .withMessage("BookingId is required")
      .bail()
      .isMongoId()
      .withMessage("Invalid BookingId"),

    body("rating")
      .notEmpty()
      .withMessage("Rating is required")
      .bail()
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5"),

    body("review")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Review is required")
      .bail()
      .isLength({ min: 5 })
      .withMessage("Review must be atleast 5 characters long"),
  ];
};

export const getMentorReviewsValidator = () => {
  return [param("mentorId").isMongoId().withMessage("Invalid mentor id")];
};

export const editReviewValidator = () => {
  return [
    param("reviewId").isMongoId().withMessage("Invalid review id"),

    body("rating")
      .notEmpty()
      .withMessage("Rating is required")
      .bail()
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5"),

    body("review")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Review is required")
      .bail()
      .isLength({ min: 5 })
      .withMessage("Review must be atleast 5 characters long"),
  ];
};

export const deleteReviewValidator = () => {
  return [param("reviewId").isMongoId().withMessage("Invalid review id")];
};


