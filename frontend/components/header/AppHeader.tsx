"use client";
import useNotification from "@/hooks/notification/useNotification";
import { Bell } from "lucide-react";
import { useState } from "react";
import NotificationDropdown from "../notifications/NotificationDropdown";

const AppHeader = () => {
  const { unreadCount } = useNotification();

  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="flex h-10 items-center justify-end border-b bg-white px-8">
      <button
        onClick={() => setShowNotifications((prev) => !prev)}
        className="relative cursor-pointer"
      >
        <Bell size={22} />

        {unreadCount > 0 && (
          <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
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
