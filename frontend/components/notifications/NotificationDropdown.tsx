"use client";

import { api } from "@/services/axios";
import { connectSocket, socket } from "@/services/socket";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState<any>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(7);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);

      const res = await api.get("/notification", {
        params: {
          page,
          limit,
        },
      });

      const newNotifications: any = res.data.data.notifications;

      const totalNotifications = res.data.data.totalNotificationCount;

      setNotifications((prev: any) => {
        if (page === 1) {
          return newNotifications;
        }

        const existingIds = new Set(
          notifications.map((notification: any) => notification._id),
        );

        const uniqueNotifications = newNotifications.filter(
          (notification: any) => !existingIds.has(notification._id),
        );

        return [...prev, ...uniqueNotifications];
      });

      setHasMore(page * limit < totalNotifications);
    } catch (error: any) {
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNewNotification = ({ newNotification }: any) => {
    setNotifications((prev: any) => [newNotification, ...prev]);
  };

  const listenForNotifications = () => {
    socket.on("new-detail-notification", handleNewNotification);
  };

  useEffect(() => {
    fetchNotifications();
  }, [page]);

  useEffect(() => {
    listenForNotifications();

    return () => {
      socket.off("new-detail-notification", handleNewNotification);
    };
  }, []);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-4 py-3">
        <h2 className="text-lg font-semibold">Notifications</h2>
      </div>

      {loading && <p className="p-4">Loading...</p>}

      {!loading && notifications.length === 0 && (
        <p className="p-4">No notifications</p>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto">
        {notifications.map((notification: any) => (
          <div
            key={notification._id}
            className={`border-b px-4 py-3 ${
              !notification.isRead ? "bg-gray-200" : "bg-white"
            }`}
          >
            <p>
              {notification.bookingId.userId.fullname} booked a consultation
              with you
            </p>

            <p className="text-sm text-gray-500">
              {new Date(notification.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="shrink-0 p-2">
          <button
            onClick={() => setPage((prev) => prev + 1)}
            className="w-full cursor-pointer py-1"
          >
            Load more
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
