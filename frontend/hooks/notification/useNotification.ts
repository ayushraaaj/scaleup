"use client";
import { api } from "@/services/axios";
import { socket } from "@/services/socket";
import { getUser } from "@/utils/auth";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const useNotification = () => {
  const user = getUser();

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

  const handleConnect = () => {
    console.log("Connected:", socket.id);
    socket.emit("join-user-room", user?._id);
  };

  useEffect(() => {
    fetchUnreadCount();

    socket.on("connect", handleConnect);

    socket.connect();

    listenForNotifications();

    return () => {
      socket.off("connect", handleConnect);
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
