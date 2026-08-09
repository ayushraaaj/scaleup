"use client";
import { api } from "@/services/axios";
import { connectSocket, socket } from "@/services/socket";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const useNotification = () => {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get("/notification/unread-count");

      setUnreadCount(res.data.data.unreadCount);
    } catch (error: any) {
      toast.error(error.response.data.message);
    }
  };

  const listenForNotifications = () => {
    socket.on("new-booking-notification", ({ unreadCount }) => {
      setUnreadCount(unreadCount);
    });
  };

  useEffect(() => {
    fetchUnreadCount();

    listenForNotifications();

    connectSocket();

    return () => {
      socket.off("new-booking-notification");
    };
  }, []);

  return {
    unreadCount,
    setUnreadCount,
    fetchUnreadCount,
  };
};

export default useNotification;
