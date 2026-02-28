import { Router } from "express";
import { checkIfMentor, verifyJWT } from "../middlewares/auth.middleware";
import {
    reactToPost,
    createPost,
    getSinglePost,
    getComments,
    addComment,
    deleteComment,
    deletePost,
    editPost,
} from "../controllers/post.controller";
import {
    addCommentValidator,
    createPostValidator,
    deleteCommentValidator,
    deletePostValidator,
    editPostValidator,
    getCommentsValidator,
    postReactionValidator,
    singlePostValidator,
} from "../validators/post.validator";
import { validate } from "../middlewares/validator.middleware";

const router = Router();

router.route("/:postId").get(singlePostValidator(), validate, getSinglePost);
router
    .route("/:postId/comments")
    .get(getCommentsValidator(), validate, getComments);

router.use(verifyJWT);

router
    .route("/:postId/comment/:commentId")
    .delete(deleteCommentValidator(), validate, deleteComment);

router.use(checkIfMentor);

router.route("/create").post(createPostValidator(), validate, createPost);
router
    .route("/:postId/react")
    .post(postReactionValidator(), validate, reactToPost);
router
    .route("/:postId/comment")
    .post(addCommentValidator(), validate, addComment);

router
    .route("/:postId")
    .delete(deletePostValidator(), validate, deletePost)
    .patch(editPostValidator(), validate, editPost);

export default router;
