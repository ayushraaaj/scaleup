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
        const { sessionType, startTime, durationInMinutes } = req.body;

        const mentor = await Mentor.findOne({ userId: mentorId });

        if (!mentor) {
            throw new ApiError(404, "Mentor not found");
        }

        const start = new Date(startTime);
        const end = new Date(start.getTime() + durationInMinutes * 60 * 1000);

        const hourlyRate =
            sessionType === "audio"
                ? mentor.pricing!.audio
                : mentor.pricing!.video;

        const totalPrice = hourlyRate * (durationInMinutes / 60);

        const overlappingBooking = await Booking.findOne({
            mentorId,
            startTime: { $lt: end },
            endTime: { $gt: start },
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
            startTime: start,
            endTime: end,
            durationInMinutes,
            hourlyRate,
            totalPrice,
            status: "pending",
            expiresAt,
        });

        return res.status(201).json(new ApiResponse("Slot reserved", booking));
    },
);
