import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { Booking } from "../models/booking.model";
import { ApiError } from "../utils/ApiError";
import { Mentor } from "../models/mentor.model";
import { Message } from "../models/message.model";
import { ApiResponse } from "../utils/ApiResponse";

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
      throw new ApiError(404, "Cant send message");
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

    if (!messages.length) {
      throw new ApiError(404, "No messages found");
    }

    return res.status(200).json(new ApiResponse("Messages fetched", messages));
  },
);
