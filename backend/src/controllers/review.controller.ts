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

    // const { bookingId } = req.params;

    const { bookingId, rating, review } = req.body;

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
      throw error;
    } finally {
      await dbSession.endSession();
    }
  },
);

export const getMentorReviews = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const { mentorId } = req.params;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ mentorId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "fullname username");

    return res
      .status(200)
      .json(new ApiResponse("Mentor reviews fetched", reviews));
  },
);

export const getReviewByUser = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "mentorId",
        select: "userId",
        populate: { path: "userId", select: "fullname username" },
      });

    return res
      .status(200)
      .json(new ApiResponse("User reviews fetched", reviews));
  },
);

export const editReview = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;

  const { reviewId } = req.params;

  const { rating, review } = req.body;

  const alreadyReviewed = await Review.findById(reviewId);

  if (!alreadyReviewed) {
    throw new ApiError(404, "Review not found");
  }

  const REVIEW_EDIT_WINDOW = 48 * 60 * 60 * 1000;

  const canEdit =
    Date.now() - alreadyReviewed.createdAt.getTime() < REVIEW_EDIT_WINDOW;

  if (!canEdit) {
    throw new ApiError(
      400,
      "Review and rating can't be edited after 48 hours of its creation",
    );
  }

  const dbSession = await mongoose.startSession();

  try {
    dbSession.startTransaction();

    const mentor = await Mentor.findById(alreadyReviewed.mentorId).session(
      dbSession,
    );

    if (!mentor) {
      throw new ApiError(404, "Mentor not found");
    }

    const totalRating = mentor.totalRating - alreadyReviewed.rating + rating;
    const ratings = Number((totalRating / mentor.totalReviews).toFixed(2));

    await Mentor.findByIdAndUpdate(
      mentor._id,
      {
        $set: {
          totalRating,
          ratings,
        },
      },
      { session: dbSession },
    );

    const newReview = await Review.findByIdAndUpdate(
      reviewId,
      {
        $set: {
          review,
          rating,
        },
      },
      { new: true, session: dbSession },
    );

    if (!newReview) {
      throw new ApiError(400, "Failed to update review");
    }

    await dbSession.commitTransaction();

    return res
      .status(200)
      .json(new ApiResponse("Review edited successfully", newReview));
  } catch (error) {
    await dbSession.abortTransaction();
    throw error;
  } finally {
    await dbSession.endSession();
  }
});
