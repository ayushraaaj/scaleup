import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { Notification } from "../models/notification.model";
import { ApiResponse } from "../utils/ApiResponse";

export const getAllNotifcations = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const [notifications, totalNotifications, unreadNotifications] =
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

        Notification.countDocuments({ recipientId: userId, isRead: false }),
      ]);

    return res.status(200).json(
      new ApiResponse("Notifications fetched", {
        notifications,
        totalNotifications,
        unreadNotifications,
      }),
    );
  },
);

export const readAllNotifications = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

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
    );

    return res.status(200).json(
      new ApiResponse("Notifications marked as read", {
        modifiedCount: notifications.modifiedCount,
      }),
    );
  },
);

export const unreadNotificationsCount = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const unreadNotifications = await Notification.countDocuments({
      recipientId: userId,
      isRead: false,
    });

    return res.status(200).json(
      new ApiResponse("Unread notifications count", {
        unreadCount: unreadNotifications,
      }),
    );
  },
);
