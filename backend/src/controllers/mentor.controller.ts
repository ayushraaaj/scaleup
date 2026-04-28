import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { Mentor } from "../models/mentor.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { Booking } from "../models/booking.model";
import { User } from "../models/user.model";

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
        new ApiResponse("Mentor profile created successfully", mentorProfile),
      );
  },
);

export const getAllMentors = asyncHandler(
  async (req: Request, res: Response) => {
    const page = Number(req.params.page) || 1;
    const limit = Number(req.params.limit) || 10;
    const skip = (page - 1) * limit;

    const mentors = await Mentor.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "fullname username");

    const totalMentors = await Mentor.countDocuments();

    return res.status(200).json(
      new ApiResponse("Mentors fetched", {
        mentors,
        totalMentors,
        totalPages: Math.ceil(totalMentors / limit),
      }),
    );
  },
);

export const getSingleMentor = asyncHandler(
  async (req: Request, res: Response) => {
    const { username } = req.params;

    const user = await User.findOne({ username });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const mentor = await Mentor.findOne({ userId: user._id }).populate(
      "userId",
      "fullname username",
    );

    if (!mentor) {
      throw new ApiError(404, "Mentor not found");
    }

    return res
      .status(200)
      .json(new ApiResponse("Mentor detail fetched", mentor));
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

    // console.log(availability);

    // Validate start time and end time
    for (const day of availability) {
      for (const slot of day.slots) {
        if (slot.startTime >= slot.endTime) {
          throw new ApiError(400, `Invalid time ranges for ${day.dayOfWeek}`);
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

    const mentor = await Mentor.findById({ _id: mentorId });

    if (!mentor) {
      throw new ApiError(404, "Mentor not found");
    }

    const availability = mentor.availability.find((a) => a.date === date);
    // console.log(availability);

    if (!availability) {
      return res
        .status(200)
        .json(new ApiResponse("Mentor is not available", {}));
    }

    const bookings = await Booking.find({
      mentorId,
      date,
      $or: [
        { status: "confirmed" },
        { status: "pending", expiresAt: { $gt: new Date() } },
      ],
    });

    const availableSlots = [];

    for (const slot of availability.slots) {
      let startSlot = slot.startTime;
      let endSlot = slot.endTime;

      while (startSlot < endSlot) {
        let [hours, minutes] = startSlot.split(":").map(Number);
        let nextHour = hours + 1;

        const nextSlot = `${nextHour.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;

        const overlapping = bookings.find(
          (b) => b.endTime > startSlot && b.startTime < nextSlot,
        );

        if (!overlapping) {
          availableSlots.push({
            startTime: startSlot,
            endTime: nextSlot,
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
