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

export const postReactionValidator = () => {
    return [
        param("postId").isMongoId().withMessage("Invalid post ID"),

        body("type")
            .notEmpty()
            .withMessage("Reaction type is required")
            .bail()
            .isIn(["like", "dislike"])
            .withMessage("Type must be  either 'like' or 'dislike'"),
    ];
};

export const addCommentValidator = () => {
    return [
        param("postId").isMongoId().withMessage("Invalid post ID"),

        body("content")
            .trim()
            .notEmpty()
            .withMessage("Content is required")
            .isLength({ min: 4 })
            .withMessage("Content must be atleast 4 characters long"),
    ];
};

export const getCommentsValidator = () => {
    return [param("postId").isMongoId().withMessage("Invalid post ID")];
};

export const deleteCommentValidator = () => {
    return [
        param("postId").isMongoId().withMessage("Invalid post ID"),

        param("commentId").isMongoId().withMessage("Invalid comment ID"),
    ];
};

export const deletePostValidator = () => {
    return [param("postId").isMongoId().withMessage("Invalid post ID")];
};

export const editPostValidator = () => {
    return [
        param("postId").isMongoId().withMessage("Invalid post ID"),

        body("title")
            .optional()
            .trim()
            .notEmpty()
            .withMessage("Title is required")
            .bail()
            .isLength({ min: 5 })
            .withMessage("Title must be atleast 5 characters long"),

        body("content")
            .optional()
            .trim()
            .notEmpty()
            .withMessage("Content is required")
            .bail()
            .isLength({ min: 50 })
            .withMessage("Content must be atleast 50 characters long"),

        body("visibility")
            .optional()
            .isString()
            .notEmpty()
            .withMessage("Visibility is required")
            .isIn(["free", "visibility"])
            .withMessage("Visibility must be either 'free' or 'premium'"),

        body("tags").optional().isArray(),
    ];
};
