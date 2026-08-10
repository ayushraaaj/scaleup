"use client";

import { api } from "@/services/axios";
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

  useEffect(() => {
    fetchNotifications();
  }, [page]);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-4">
        <h2 className="text-lg font-semibold">Notifications</h2>
      </div>

      {loading && <p>Loading...</p>}

      {!loading && notifications.length === 0 && <p>No notifications</p>}

      <div>
        <div className="flex-1 overflow-y-auto">
          {notifications.map((notification: any) => (
            <div key={notification._id} className="border-b px-4 py-3">
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
          <div className="border-t p-2">
            <button
              onClick={() => setPage((prev) => prev + 1)}
              className="w-full py-2 cursor-pointer"
            >
              Load more
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;
