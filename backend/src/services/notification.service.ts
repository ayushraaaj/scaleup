import mongoose from "mongoose";
import { Notification } from "../models/notification.model";
import { User } from "../models/user.model";

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

      await User.findByIdAndUpdate(
        recipientId,
        {
          $inc: {
            unreadNotificationCount: 1,
          },
        },
        { session: dbSession },
      );

      await dbSession.commitTransaction();
    } catch (error) {
      await dbSession.abortTransaction();

      throw error;
    } finally {
      dbSession.endSession();
    }
  }
}

export default new NotificationService();
