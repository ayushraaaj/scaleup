import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import {
  createReview,
  deleteReview,
  editReview,
  getMentorReviews,
  getReviewByUser,
} from "../controllers/review.controller";

const router = Router();

router.use(verifyJWT);

router.route("/create").post(createReview);

router.route("/mentor/:mentorId").get(getMentorReviews);

router.route("/my").get(getReviewByUser);

router.route("/:reviewId").patch(editReview).delete(deleteReview);

export default router;
