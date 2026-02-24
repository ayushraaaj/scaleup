import { Router } from "express";
import { checkIfMentor, verifyJWT } from "../middlewares/auth.middleware";
import {
    createPost,
    getMentorPosts,
    getSinglePost,
} from "../controllers/post.controller";
import { createPostValidator, singlePostValidator } from "../validators/post.validator";
import { validate } from "../middlewares/validator.middleware";

const router = Router();

router.route("/:postId").get(singlePostValidator(), validate, getSinglePost);

router.use(verifyJWT);
router.use(checkIfMentor);

router.route("/create").post(createPostValidator(), validate, createPost);

export default router;
