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
} from "lucide-react";

const Sidebar = () => {
    const pathname = usePathname();

    const menuItems = [
        { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
        { name: "My Videos", path: "/videos", icon: Video },
        { name: "Monetization", path: "/monetization", icon: DollarSign },
        { name: "Audience", path: "/audience", icon: Users },
        { name: "Analytics", path: "/analytics", icon: BarChart3 },
    ];

    return (
        <aside className="w-64 h-screen border-r border-gray-200 bg-[#fcfcfc] flex flex-col justify-between p-6">
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
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.path;
                        return (
                            <Link
                                key={item.name}
                                href={item.path}
                                className={`flex items-center gap-3 px-4 py-3 text-sm font-bold transition-all border-l-4 ${
                                    isActive
                                        ? "bg-black text-white border-black"
                                        : "text-gray-500 border-transparent hover:bg-gray-100 hover:text-black"
                                }`}
                            >
                                <Icon size={18} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Footer / User Profile */}
            <div className="border-t border-gray-200 pt-6">
                <Link
                    href="/settings"
                    className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-500 hover:text-black"
                >
                    <Settings size={18} />
                    Settings
                </Link>
            </div>
        </aside>
    );
};

export default Sidebar;
