import mongoose from "mongoose";
import { Notification } from "../models/notification.model";

class NotificationService {
  async createBookingNotification({
    recipientId,
    bookingId,
  }: {
    recipientId: mongoose.Types.ObjectId;
    bookingId: mongoose.Types.ObjectId;
  }) {
    console.log("Notification called");
    return await Notification.create({ recipientId, bookingId });
  }
}

export default new NotificationService();
