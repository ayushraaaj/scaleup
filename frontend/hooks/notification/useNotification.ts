"use client";
import { api } from "@/services/axios";
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

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  return {
    unreadCount,
    setUnreadCount,
    fetchUnreadCount,
  };
};

export default useNotification;
