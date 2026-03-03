import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { Mentor } from "../models/mentor.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";

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
