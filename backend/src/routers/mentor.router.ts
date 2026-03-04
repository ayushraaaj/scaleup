import { Router } from "express";
import { checkIfMentor, verifyJWT } from "../middlewares/auth.middleware";
import {
    createMontorProfile,
    getAvailability,
    updateAvailability,
} from "../controllers/mentor.controller";
import {
    getAvailabilityValidator,
    mentorProfileValidator,
    updateAvailabilityValidator,
} from "../validators/mentor.validator";
import { validate } from "../middlewares/validator.middleware";
import { getMentorPosts } from "../controllers/post.controller";

const router = Router();

router.route("/:username/posts").get(getMentorPosts);

router.use(verifyJWT);

router
    .route("/profile")
    .post(mentorProfileValidator(), validate, createMontorProfile);

router
    .route("/:mentorId/availability")
    .get(getAvailabilityValidator(), validate, getAvailability);

router.use(checkIfMentor);

router
    .route("/availability")
    .patch(updateAvailabilityValidator(), validate, updateAvailability);

export default router;
