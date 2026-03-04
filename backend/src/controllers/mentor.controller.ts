import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { Mentor } from "../models/mentor.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { Booking } from "../models/booking.model";

export const createMontorProfile = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = req.user?._id;

        const { bio, expertise, pricing } = req.body;

        const existingMentor = await Mentor.findOne({ userId });

        if (existingMentor) {
            throw new ApiError(409, "Mentor profile already exists");
        }

        const mentorProfile = await Mentor.create({
            userId,
            bio,
            expertise,
            pricing,
        });

        return res
            .status(201)
            .json(
                new ApiResponse(
                    "Mentor profile created successfully",
                    mentorProfile,
                ),
            );
    },
);

export const updateAvailability = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = req.user?._id;
        const { availability } = req.body;

        const mentor = await Mentor.findOne({ userId });

        if (!mentor) {
            throw new ApiError(404, "Mentor not found");
        }

        console.log(availability);

        // Validate start time and end time
        for (const day of availability) {
            for (const slot of day.slots) {
                if (slot.startTime >= slot.endTime) {
                    throw new ApiError(
                        400,
                        `Invalid time ranges for ${day.dayOfWeek}`,
                    );
                }
            }

            // Sorting availability array
            const sortedSlots = [...day.slots].sort((a, b) =>
                a.startTime.localeCompare(b.startTime),
            );

            // Checking for overlapping of a day
            for (let i = 1; i < sortedSlots.length; i++) {
                if (sortedSlots[i].startTime < sortedSlots[i - 1].endTime) {
                    throw new ApiError(
                        400,
                        `Overlapping slots detected on day ${day.dayOfWeek}`,
                    );
                }
            }
        }

        mentor.availability = availability;
        await mentor.save({ validateBeforeSave: false });

        return res
            .status(200)
            .json(
                new ApiResponse(
                    "Availability updated successfully",
                    mentor.availability,
                ),
            );
    },
);

const combineDateAndTime = (date: Date, time: string) => {
    const [hours, minutes] = time.split(":").map(Number);

    const newDate = new Date(date);
    newDate.setHours(hours, minutes, 0, 0);

    return newDate;
};

export const getAvailability = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = req.user?._id;
        const { mentorId } = req.params;
        const { date } = req.query;

        const requestedDate = new Date(date as string);
        if (isNaN(requestedDate.getTime())) {
            throw new ApiError(400, "Invalid date format");
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (requestedDate < today) {
            throw new ApiError(400, "Cannot book past dates");
        }

        const maxBookingDate = new Date(today);
        maxBookingDate.setDate(today.getDate() + 30);

        if (requestedDate > maxBookingDate) {
            throw new ApiError(400, "Booking allowed only within next 30 days");
        }

        const dayOfWeek = requestedDate.getDay();

        const mentor = await Mentor.findOne({ userId: mentorId });

        if (!mentor) {
            throw new ApiError(404, "Mentor not found");
        }

        const availability = mentor.availability.find(
            (a) => a.dayOfWeek === dayOfWeek,
        );

        if (!availability) {
            return res
                .status(200)
                .json(new ApiResponse("Mentor is not available", {}));
        }

        const startOfDay = new Date(requestedDate);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(requestedDate);
        endOfDay.setHours(11, 59, 59, 999);

        const bookings = await Booking.find({
            mentorId,
            startTime: { $gte: startOfDay, $lte: endOfDay },
            $or: [
                { status: "confirmed" },
                { status: "pending", expiresAt: { $gt: new Date() } },
            ],
        });

        const availableSlots = [];

        for (const slot of availability.slots) {
            let startSlot = combineDateAndTime(requestedDate, slot.startTime);
            let endSlot = combineDateAndTime(requestedDate, slot.endTime);

            while (startSlot < endSlot) {
                const nextSlot = new Date(startSlot.getTime() + 30 * 60 * 1000);

                const overlapping = bookings.find(
                    (b) => b.endTime > startSlot && b.startTime < nextSlot,
                );

                if (!overlapping) {
                    availableSlots.push({
                        startTime: startSlot.toISOString(),
                        endTime: nextSlot.toISOString(),
                    });
                }

                startSlot = nextSlot;
            }
        }

        return res
            .status(200)
            .json(new ApiResponse("Available slots", availableSlots));
    },
);
