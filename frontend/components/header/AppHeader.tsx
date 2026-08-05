"use client";
import useNotification from "@/hooks/notification/useNotification";
import { Bell } from "lucide-react";

const AppHeader = () => {
  const { unreadCount } = useNotification();

  return (
    <header className="flex h-10 items-center justify-end border-b bg-white px-8">
      <button className="relative">
        <Bell size={22} />

        {unreadCount && (
          <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
            {unreadCount}
          </span>
        )}
      </button>
    </header>
  );
};

export default AppHeader;
