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
