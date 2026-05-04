import { Router } from "express";
import { checkIfMentor, verifyJWT } from "../middlewares/auth.middleware";
import {
  createMontorProfile,
  getAllMentors,
  getAvailability,
  getSingleMentor,
  mentorSessions,
  updateAvailability,
} from "../controllers/mentor.controller";
import {
  getAvailabilityValidator,
  mentorProfileValidator,
  singleMentorValidator,
  updateAvailabilityValidator,
} from "../validators/mentor.validator";
import { validate } from "../middlewares/validator.middleware";
import { getMentorPosts } from "../controllers/post.controller";

const router = Router();

router.route("/:username/posts").get(getMentorPosts);


router.use(verifyJWT);

router.route("/my-sessions").get(checkIfMentor, mentorSessions);

router
  .route("/profile")
  .post(mentorProfileValidator(), validate, createMontorProfile);

router.route("/all").get(getAllMentors);

router
  .route("/:username")
  .get(singleMentorValidator(), validate, getSingleMentor);

router
  .route("/:mentorId/availability")
  .get(getAvailabilityValidator(), validate, getAvailability);

router.use(checkIfMentor);

router
  .route("/availability")
  .patch(updateAvailabilityValidator(), validate, updateAvailability);

export default router;
