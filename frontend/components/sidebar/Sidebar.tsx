"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Video,
    DollarSign,
    Settings,
    Users,
    BarChart3,
    PlusSquare,
    PenSquare,
} from "lucide-react";
import SidebarItem from "./SidebarItem";
import { getUserRole } from "@/utils/auth";

const Sidebar = () => {
    const pathname = usePathname();

    const userRole = getUserRole();

    return (
        <aside className="w-64 h-screen border-r border-gray-200 bg-[#fcfcfc] flex shrink-0 flex-col justify-between p-6">
            <div>
                {/* Logo Area */}
                <div className="flex items-center gap-2 mb-12">
                    <div className="h-8 w-8 bg-black flex items-center justify-center rounded-sm rotate-[-10deg]">
                        <span className="text-white font-black text-xl">S</span>
                    </div>
                    <span className="text-xl font-black tracking-tighter text-black uppercase italic">
                        ScaleUp
                    </span>
                </div>

                {/* Navigation Links */}
                <nav className="space-y-1">
                    {userRole === "mentor" && (
                        <SidebarItem
                            href="/dashboard/create-post"
                            label="Create Post"
                            icon={<PenSquare size={18} />}
                        ></SidebarItem>
                    )}

                    <SidebarItem
                        href="/dashboard/feed"
                        label="Feed"
                        icon={<LayoutDashboard size={18} />}
                    />

                    <SidebarItem
                        href="/dashboard/videos"
                        label="Videos"
                        icon={<Video size={18} />}
                    />

                    <SidebarItem
                        href="/dashboard/mentors"
                        label="Mentors"
                        icon={<Users size={18} />}
                    />

                    <SidebarItem
                        href="/dashboard/settings"
                        label="Settings"
                        icon={<Settings size={18} />}
                    />
                </nav>
            </div>

            {/* Footer / User Profile */}
            <div className="border-t border-gray-200 pt-6">
                {/* <Link
                    href="/settings"
                    className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-500 hover:text-black"
                >
                    <Settings size={18} />
                    Settings
                </Link> */}
            </div>
        </aside>
    );
};

export default Sidebar;
