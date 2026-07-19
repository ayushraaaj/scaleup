import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import {
  createReview,
  deleteReview,
  editReview,
  getMentorReviews,
  getReviewByUser,
} from "../controllers/review.controller";
import {
  createReviewValidator,
  deleteReviewValidator,
  editReviewValidator,
  getMentorReviewsValidator,
} from "../validators/review.validator";
import { validate } from "../middlewares/validator.middleware";

const router = Router();

router.use(verifyJWT);

router.route("/create").post(createReviewValidator(), validate, createReview);

router
  .route("/mentor/:mentorId")
  .get(getMentorReviewsValidator(), validate, getMentorReviews);

router.route("/my").get(getReviewByUser);

router
  .route("/:reviewId")
  .patch(editReviewValidator(), validate, editReview)
  .delete(deleteReviewValidator(), validate, deleteReview);

export default router;
