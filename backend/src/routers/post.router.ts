import { Router } from "express";
import { checkIfMentor, verifyJWT } from "../middlewares/auth.middleware";
import {
    reactToPost,
    createPost,
    getMentorPosts,
    getSinglePost,
    getComments,
    addComment,
} from "../controllers/post.controller";
import {
    createPostValidator,
    postReactionValidator,
    singlePostValidator,
} from "../validators/post.validator";
import { validate } from "../middlewares/validator.middleware";

const router = Router();

router.route("/:postId").get(singlePostValidator(), validate, getSinglePost);
router.route("/:postId/comments").get(getComments);

router.use(verifyJWT);
router.use(checkIfMentor);

router.route("/create").post(createPostValidator(), validate, createPost);
router
    .route("/:postId/react")
    .post(postReactionValidator(), validate, reactToPost);
router.route("/:postId/comment").post(addComment);

export default router;
