import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { Mentor } from "../models/mentor.model";
import { ApiError } from "../utils/ApiError";
import { Booking } from "../models/booking.model";
import { ApiResponse } from "../utils/ApiResponse";

export const createBooking = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { mentorId } = req.params;
    const { sessionType, date, startTime, endTime } = req.body;

    const mentor = await Mentor.findById({ _id: mentorId });

    if (!mentor) {
      throw new ApiError(404, "Mentor not found");
    }

    if (!mentor.availability || mentor.availability.length === 0) {
      throw new ApiError(400, "Mentor is not available");
    }

    const availability = mentor.availability.find((a) => a.date === date);

    if (!availability) {
      throw new ApiError(400, "Mentor not available on this day");
    }

    const isWithinSlot = availability.slots.some(
      (slot) => slot.startTime <= startTime && slot.endTime >= endTime,
    );

    if (!isWithinSlot) {
      throw new ApiError(400, "Selected time is outside mentors availability");
    }

    const hourlyRate =
      sessionType === "audio" ? mentor.pricing!.audio : mentor.pricing!.video;

    const totalPrice = hourlyRate;

    const overlappingBooking = await Booking.findOne({
      mentorId,
      date,
      startTime,
      endTime,
      $or: [
        { status: "confirmed" },
        { status: "pending", expiresAt: { $gt: new Date() } },
      ],
    });

    if (overlappingBooking) {
      throw new ApiError(409, "Time slot is not available");
    }

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const booking = await Booking.create({
      mentorId,
      userId,
      sessionType,
      date,
      startTime,
      endTime,
      hourlyRate,
      totalPrice,
      status: "confirmed",
      // status: "pending",
      expiresAt,
    });

    return res.status(201).json(new ApiResponse("Slot reserved", booking));
  },
);

export const getBookings = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;

  const bookings = await Booking.find({
    userId: userId,
    status: "confirmed",
  }).populate({
    path: "mentorId",
    select: "userId",
    populate: { path: "userId", select: "username fullname" },
  });

  return res
    .status(200)
    .json(new ApiResponse("Bookings are fetched", bookings));
});
