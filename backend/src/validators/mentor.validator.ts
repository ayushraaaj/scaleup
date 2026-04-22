import { body, param, query } from "express-validator";

export const mentorProfileValidator = () => {
  return [
    body("bio")
      .trim()
      .notEmpty()
      .withMessage("Bio is required")
      .bail()
      .isLength({ min: 10 })
      .withMessage("Bio must be atleast 10 characters long"),

    body("expertise")
      .isArray({ min: 1 })
      .withMessage("Expertise must have atleast one skill"),

    body("expertise.*")
      .notEmpty()
      .isString()
      .trim()
      .withMessage("Expertise must be a valid string"),

    body("pricing.audio")
      .isNumeric()
      .withMessage("Price must be a number")
      .bail()
      .custom((val) => val >= 0)
      .withMessage("Price cannot be negative"),

    body("pricing.video")
      .isNumeric()
      .withMessage("Price must be a number")
      .bail()
      .custom((val) => val >= 0)
      .withMessage("Price cannot be negative"),
  ];
};

export const singleMentorValidator = () => {
  return [
    param("username")
      .trim()
      .notEmpty()
      .withMessage("Username is required")
      .bail()
      .isAlphanumeric()
      .withMessage("Username must be alphanumeric"),
  ];
};

export const updateAvailabilityValidator = () => {
  return [
    body("availability").isArray().withMessage("Availability must be an array"),

    body("availability.*.date").isDate().withMessage("Date is invalid"),

    body("availability.*.slots")
      .isArray({ min: 1 })
      .withMessage("Slots must be a non empty array"),

    body("availability.*.slots.*.startTime")
      .notEmpty()
      .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
      .withMessage("Start time must be in HH:mm format"),

    body("availability.*.slots.*.endTime")
      .notEmpty()
      .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
      .withMessage("End time must be in HH:mm format"),
  ];
};

export const getAvailabilityValidator = () => {
  return [
    param("mentorId").isMongoId().withMessage("Invalid mentor ID"),

    query("date")
      .trim()
      .notEmpty()
      .withMessage("Date is required")
      .bail()
      .isISO8601()
      .withMessage("Date must be in YYYY-MM-DD format"),
  ];
};
