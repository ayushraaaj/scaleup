import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import {
  createBookingValidator,
  detailedBookingValidator,
} from "../validators/booking.validator";
import { validate } from "../middlewares/validator.middleware";
import {
  createBooking,
  getBookings,
  getDetailedBooking,
} from "../controllers/booking.controller";

const router = Router();

router.use(verifyJWT);

router
  .route("/:mentorId")
  .post(createBookingValidator(), validate, createBooking);

router.route("/my-bookings").get(getBookings);

router
  .route("/my-bookings/:bookingId")
  .get(detailedBookingValidator(), validate, getDetailedBooking);

export default router;
