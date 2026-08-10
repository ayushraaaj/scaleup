import mongoose from "mongoose";
import { Notification } from "../models/notification.model";
import { User } from "../models/user.model";
import { getIO } from "./socket";

class NotificationService {
  async createBookingNotification({
    recipientId,
    bookingId,
  }: {
    recipientId: mongoose.Types.ObjectId;
    bookingId: mongoose.Types.ObjectId;
  }) {
    const dbSession = await mongoose.startSession();

    try {
      dbSession.startTransaction();

      const notification = new Notification({
        recipientId,
        bookingId,
      });

      await notification.save({ session: dbSession });

      const user = await User.findByIdAndUpdate(
        recipientId,
        {
          $inc: {
            unreadNotificationCount: 1,
          },
        },
        { session: dbSession, returnDocument: "after" },
      );

      await dbSession.commitTransaction();

      const populatedNotification = await Notification.findById(
        notification._id,
      ).populate({
        path: "bookingId",
        populate: {
          path: "userId",
          select: "fullname username",
        },
      });

      const io = getIO();

      io.to(`${recipientId}`).emit("new-booking-notification", {
        unreadCount: user?.unreadNotificationCount,
      });

      io.to(`${recipientId}`).emit("new-detail-notification", {
        newNotification: populatedNotification,
      });
    } catch (error) {
      await dbSession.abortTransaction();

      throw error;
    } finally {
      dbSession.endSession();
    }
  }
}

export default new NotificationService();
