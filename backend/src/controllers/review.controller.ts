import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { Booking } from "../models/booking.model";
import { ApiError } from "../utils/ApiError";
import { Session } from "../models/session.model";
import { Review } from "../models/review.model";
import { ApiResponse } from "../utils/ApiResponse";
import mongoose from "mongoose";
import { Mentor } from "../models/mentor.model";

export const createReview = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const { bookingId } = req.params;

    const { rating, review } = req.body;

    const alreadyReviewed = await Review.findOne({ bookingId });

    if (alreadyReviewed) {
      throw new ApiError(400, "You have already reviewed this session");
    }

    const booking = await Booking.findOne({ _id: bookingId, userId });

    if (!booking) {
      throw new ApiError(404, "Booking not found");
    }

    const session: any = await Session.findOne({ bookingId });

    if (!session) {
      throw new ApiError(404, "Session not found");
    }

    if (session.sessionStatus !== "completed") {
      throw new ApiError(
        400,
        "Reviews can only be submitted after a completed session",
      );
    }

    const REVIEW_WINDOW = 7 * 24 * 60 * 60 * 1000;

    const canReview =
      Date.now() - session.completedAt.getTime() < REVIEW_WINDOW;

    if (!canReview) {
      throw new ApiError(
        400,
        "Rating and review is not available after 7 days of session",
      );
    }

    const dbSession = await mongoose.startSession();

    try {
      dbSession.startTransaction();

      const newReview = await Review.create(
        [
          {
            bookingId,
            mentorId: booking.mentorId,
            userId,
            rating,
            review,
          },
        ],
        { session: dbSession },
      );

      const mentor = await Mentor.findById(booking.mentorId).session(dbSession);

      if (!mentor) {
        throw new ApiError(404, "Mentor not found");
      }

      const totalRating = mentor.totalRating + rating;
      const totalReviews = mentor.totalReviews + 1;

      const ratings = Number((totalRating / totalReviews).toFixed(2));

      await Mentor.findByIdAndUpdate(
        mentor._id,
        {
          $set: {
            totalRating,
            totalReviews,
            ratings,
          },
        },
        {
          session: dbSession,
        },
      );

      await dbSession.commitTransaction();

      return res
        .status(201)
        .json(new ApiResponse("Review created successfully", newReview[0]));
    } catch (error) {
      await dbSession.abortTransaction();
    } finally {
      await dbSession.endSession();
    }
  },
);
