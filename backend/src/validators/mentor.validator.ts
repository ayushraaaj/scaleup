import { body } from "express-validator";

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
            .isString()
            .trim()
            .notEmpty()
            .withMessage("Expertise must be a valid string"),

        body("pricing.audio")
            .isNumeric()
            .withMessage("Price must be a number")
            .custom((val) => val >= 0)
            .withMessage("Price cannot be negative"),

        body("pricing.video")
            .isNumeric()
            .withMessage("Price must be a number")
            .custom((val) => val >= 0)
            .withMessage("Price cannot be negative"),
    ];
};

export const availabilityValidator = () => {
    return [
        body("availability")
            .isArray({ min: 1 })
            .withMessage("Availability must be a non empty array"),

        body("availability.*.dayOfWeek")
            .isInt({ min: 0, max: 6 })
            .withMessage("Day of week must be between 0 and 6"),

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
