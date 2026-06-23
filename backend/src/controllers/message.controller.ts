import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { Booking } from "../models/booking.model";
import { ApiError } from "../utils/ApiError";
import { Message } from "../models/message.model";
import { ApiResponse } from "../utils/ApiResponse";
import { uploadOnCloudinary } from "../utils/uploadOnCloudinary";
import fs from "fs";

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

    let fileUrl = "",
      fileName = "",
      fileType = "";

    if (req.file) {
      console.log(req.file);

      let uploadedFile;

      try {
        uploadedFile = await uploadOnCloudinary(req.file.path);

        // console.log(uploadedFile);
      } finally {
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      }

      fileUrl = uploadedFile.secure_url;
      fileName = req.file.originalname;
      fileType = req.file.mimetype;
    }

    const message = await Message.create({
      bookingId,
      senderId: userId,
      content,
      fileUrl,
      fileName,
      fileType,
    });

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
