import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { createBookingValidator } from "../validators/booking.validator";
import { validate } from "../middlewares/validator.middleware";
import { createBooking, getBookings } from "../controllers/booking.controller";

const router = Router();

router.use(verifyJWT);

router
  .route("/:mentorId")
  .post(createBookingValidator(), validate, createBooking);

router.route("/my-bookings").get(getBookings);

export default router;
