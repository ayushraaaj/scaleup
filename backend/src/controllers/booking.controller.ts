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

        if (!mentor.availability || mentor.availability.length === 0) {
            throw new ApiError(400, "Mentor is not available");
        }

        const start = new Date(startTime);
        const end = new Date(start.getTime() + durationInMinutes * 60 * 1000);

        // const minutes = start.getMinutes();
        // if (minutes !== 0 && minutes !== 30) {
        //     throw new ApiError(
        //         400,
        //         "Start time must start at 00 or 30 minutes",
        //     );
        // }

        // const now = new Date();

        // if (start < now) {
        //     throw new ApiError(400, "Cannot book past time");
        // }

        // const maxBookingDate = new Date();
        // maxBookingDate.setDate(maxBookingDate.getDate() + 30);

        // if (start > maxBookingDate) {
        //     throw new ApiError(400, "Booking allowed only within 30 days");
        // }

        const dayOfWeek = start.getDay();

        const availability = mentor.availability.find(
            (a) => a.dayOfWeek === dayOfWeek,
        );

        if (!availability) {
            throw new ApiError(400, "Mentor not available on this day");
        }

        const requestedStartTime = start.toTimeString().slice(0, 5);
        const requestedEndTime = end.toTimeString().slice(0, 5);

        const isWithinSlot = availability.slots.some(
            (slot) =>
                slot.startTime <= requestedStartTime &&
                slot.endTime >= requestedEndTime,
        );

        if (!isWithinSlot) {
            throw new ApiError(
                400,
                "Selected time is outside mentors availability",
            );
        }

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
