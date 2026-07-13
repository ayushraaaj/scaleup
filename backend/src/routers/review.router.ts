import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { createReview } from "../controllers/review.controller";

const router = Router();

router.use(verifyJWT);

router.route(`/create/:bookingId`).post(createReview);

export default router;
