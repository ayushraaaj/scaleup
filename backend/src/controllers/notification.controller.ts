import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { Notification } from "../models/notification.model";
import { ApiResponse } from "../utils/ApiResponse";
import { User } from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import mongoose from "mongoose";

export const getAllNotifcations = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const [notifications, totalNotificationCount, unreadNotificationCount] =
      await Promise.all([
        Notification.find({ recipientId: userId })
          .populate({
            path: "bookingId",
            populate: { path: "userId", select: "username fullname" },
          })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),

        Notification.countDocuments({ recipientId: userId }),

        // Notification.countDocuments({ recipientId: userId, isRead: false }),

        User.findById(userId).select("unreadNotificationCount"),
      ]);

    return res.status(200).json(
      new ApiResponse("Notifications fetched", {
        notifications,
        totalNotificationCount,
        unreadNotificationCount,
      }),
    );
  },
);

export const readAllNotifications = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const dbSession = await mongoose.startSession();

    try {
      dbSession.startTransaction();

      const notifications = await Notification.updateMany(
        {
          recipientId: userId,
          isRead: false,
        },
        {
          $set: {
            isRead: true,
          },
        },
        { session: dbSession },
      );

      await User.findByIdAndUpdate(
        userId,
        {
          $inc: {
            unreadNotificationCount: -notifications.modifiedCount,
          },
        },
        { session: dbSession },
      );

      await dbSession.commitTransaction();

      return res.status(200).json(
        new ApiResponse("Notifications marked as read", {
          modifiedCount: notifications.modifiedCount,
        }),
      );
    } catch (error) {
      await dbSession.abortTransaction();

      throw error;
    } finally {
      await dbSession.endSession();
    }
  },
);

export const unreadNotificationsCount = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return res.status(200).json(
      new ApiResponse("Unread notifications count", {
        unreadCount: user.unreadNotificationCount,
      }),
    );
  },
);
