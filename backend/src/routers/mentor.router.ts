import { Router } from "express";
import { checkIfMentor, verifyJWT } from "../middlewares/auth.middleware";
import {
  createMontorProfile,
  detailedMentorSession,
  getAllMentors,
  getAvailabilityForMentor,
  getAvailabilityForUser,
  getSingleMentor,
  mentorSessions,
  updateAvailability,
  updateMentorProfile,
} from "../controllers/mentor.controller";
import {
  getAvailabilityForUserValidator,
  mentorProfileValidator,
  singleMentorValidator,
  updateAvailabilityValidator,
} from "../validators/mentor.validator";
import { validate } from "../middlewares/validator.middleware";
import { getMentorPosts } from "../controllers/post.controller";

const router = Router();

router.use(verifyJWT);

router.route("/my-posts").get(getMentorPosts);

router.route("/my-sessions").get(checkIfMentor, mentorSessions);

router
  .route("/profile")
  .post(mentorProfileValidator(), validate, createMontorProfile)
  .patch(mentorProfileValidator(), validate, updateMentorProfile);

router.route("/all").get(getAllMentors);

router
  .route("/availability")
  .get(getAvailabilityForMentor)
  .patch(updateAvailabilityValidator(), validate, updateAvailability);

router
  .route("/:username")
  .get(singleMentorValidator(), validate, getSingleMentor);

router
  .route("/:mentorId/availability")
  .get(getAvailabilityForUserValidator(), validate, getAvailabilityForUser);

router.use(checkIfMentor);

router.route("/my-sessions/:sessionId").get(detailedMentorSession);

export default router;
