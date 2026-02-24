import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { createMontorProfile } from "../controllers/mentor.controller";
import { mentorProfileValidator } from "../validators/mentor.validator";
import { validate } from "../middlewares/validator.middleware";
import { getMentorPosts } from "../controllers/post.controller";

const router = Router();

router.route("/:username/posts").get(getMentorPosts);

router.use(verifyJWT);

router
    .route("/profile")
    .post(mentorProfileValidator(), validate, createMontorProfile);

export default router;
