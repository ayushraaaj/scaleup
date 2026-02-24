import { body, param } from "express-validator";

export const createPostValidator = () => {
    return [
        body("title")
            .trim()
            .notEmpty()
            .withMessage("Title is required")
            .bail()
            .isLength({ min: 5 })
            .withMessage("Title must be atleast 5 characters long"),

        body("content")
            .trim()
            .notEmpty()
            .withMessage("Content is required")
            .bail()
            .isLength({ min: 50 })
            .withMessage("Content must be atleast 50 characters long"),
    ];
};

export const singlePostValidator = () => {
    return [param("postId").isMongoId().withMessage("Invalid post ID")];
};
