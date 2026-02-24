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
