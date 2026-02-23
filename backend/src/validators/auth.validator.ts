import { body } from "express-validator";

export const signupValidator = () => {
    return [
        body("fullname")
            .trim()
            .notEmpty()
            .withMessage("Fullname is required")
            .bail()
            .isLength({ min: 3 })
            .withMessage("Fullname must be atleast 3 characters long"),

        body("username")
            .trim()
            .notEmpty()
            .withMessage("Username is required")
            .bail()
            .isLowercase()
            .withMessage("Username must be in lower case")
            .bail()
            .isLength({ min: 3 })
            .withMessage("Username must be atleast 3 characters long"),

        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required")
            .bail()
            .isLowercase()
            .withMessage("Email must be in lowercase")
            .bail()
            .isEmail()
            .withMessage("Please enter a valid email address."),

        body("password")
            .trim()
            .notEmpty()
            .withMessage("Password is required")
            .bail()
            .isLength({
                min: 5,
            })
            .withMessage(
                "Password must contain uppercase, lowercase, number, and special character",
            ),
    ];
};

export const loginValidator = () => {
    return [
        body("username_email")
            .trim()
            .notEmpty()
            .withMessage("Username or email is required"),

        body("password").trim().notEmpty().withMessage("Password is required"),
    ];
};
