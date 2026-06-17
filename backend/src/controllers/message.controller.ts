import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { Booking } from "../models/booking.model";
import { ApiError } from "../utils/ApiError";
import { Mentor } from "../models/mentor.model";
import { Message } from "../models/message.model";
import { ApiResponse } from "../utils/ApiResponse";
import { uploadOnCloudinary } from "../utils/uploadOnCloudinary";

export const createMessage = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const { bookingId } = req.params;
    const { content } = req.body;

    const booking: any = await Booking.findById(bookingId).populate(
      "mentorId",
      "userId",
    );

    if (!booking) {
      throw new ApiError(404, "Booking not found");
    }

    const mentor = booking.mentorId;

    if (
      userId.toString() !== booking.userId.toString() &&
      userId.toString() !== mentor.userId.toString()
    ) {
      throw new ApiError(404, "Can't send message");
    }

    const message = await Message.create({
      bookingId,
      senderId: userId,
      content,
    });

    if (!message) {
      throw new ApiError(400, "Something went wrong while sending message");
    }

    return res
      .status(201)
      .json(new ApiResponse("Message sent successfully", message));
  },
);

export const showMessages = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const { bookingId } = req.params;

    const booking: any = await Booking.findById(bookingId);

    if (!booking) {
      throw new ApiError(404, "Booking not found");
    }

    const messages = await Message.find({ bookingId })
      .sort({ updatedAt: 1 })
      .populate("senderId", "fullname username");

    return res.status(200).json(new ApiResponse("Messages fetched", messages));
  },
);

export const uploadFile = asyncHandler(async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return;
    }

    console.log(req.file);

    const uploadedFile = await uploadOnCloudinary(req.file.path);

    return res.status(200).json(
      new ApiResponse("Uploaded", {
        fileUrl: uploadedFile.secure_url,
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
      }),
    );
  } catch {
    throw new ApiError(500, "File upload failed");
  }
});
