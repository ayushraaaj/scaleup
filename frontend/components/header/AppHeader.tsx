"use client";
import useNotification from "@/hooks/notification/useNotification";
import { Bell } from "lucide-react";
import { useState } from "react";
import NotificationDropdown from "../notifications/NotificationDropdown";
import toast from "react-hot-toast";
import { api } from "@/services/axios";

const AppHeader = () => {
  const { unreadCount, setUnreadCount } = useNotification();

  const [showNotifications, setShowNotifications] = useState(false);

  const handleBellClick = async () => {
    if (showNotifications) {
      try {
        await api.patch("/notification/read-all");
      } catch (error: any) {
        toast.error(error.response.data.message);
      }
    }

    setShowNotifications((prev) => !prev);
    setUnreadCount(0);
  };

  return (
    <header className="flex h-10 items-center justify-end border-b bg-white px-8">
      <button onClick={handleBellClick} className="relative cursor-pointer">
        <Bell size={26} />

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {showNotifications && (
        <div className="absolute right-5 top-10 z-50 h-[590px] w-96 rounded-lg bg-white shadow-lg">
          <NotificationDropdown />
        </div>
      )}
    </header>
  );
};

export default AppHeader;
