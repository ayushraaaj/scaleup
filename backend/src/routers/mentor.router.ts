import { Router } from "express";
import { checkIfMentor, verifyJWT } from "../middlewares/auth.middleware";
import {
    createMontorProfile,
    updateAvailability,
} from "../controllers/mentor.controller";
import {
    availabilityValidator,
    mentorProfileValidator,
} from "../validators/mentor.validator";
import { validate } from "../middlewares/validator.middleware";
import { getMentorPosts } from "../controllers/post.controller";

const router = Router();

router.route("/:username/posts").get(getMentorPosts);

router.use(verifyJWT);

router
    .route("/profile")
    .post(mentorProfileValidator(), validate, createMontorProfile);

router.use(checkIfMentor);

router
    .route("/availability")
    .patch(availabilityValidator(), validate, updateAvailability);

export default router;
