import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

interface Props {
    href: string;
    label: string;
    icon: ReactNode;
}

const getActiveTab = (pathname: string) => {
    if (pathname.includes("settings")) return "settings";
    if (pathname.includes("feed")) return "feed";
    if (pathname.includes("mentors")) return "mentors";
    if (pathname.includes("videos")) return "videos";
    if (pathname.includes("create-post")) return "create-post";
    if (pathname.includes("my-bookings")) return "my-bookings";
    if (pathname.includes("my-sessions")) return "my-sessions";

};

const getTabKeyFromHref = (href: string) => {
    if (href.includes("settings")) return "settings";
    if (href.includes("feed")) return "feed";
    if (href.includes("mentors")) return "mentors";
    if (href.includes("videos")) return "videos";
    if (href.includes("create-post")) return "create-post";
    if (href.includes("my-bookings")) return "my-bookings";
    if(href.includes('my-sessions')) return "my-sessions";
    
};

const SidebarItem = (props: Props) => {
    const { href, label, icon } = props;

    const pathname = usePathname();

    const currentTab = getTabKeyFromHref(href);
    const activeTab = getActiveTab(pathname);

    const isActive = currentTab === activeTab;

    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-4 py-3 text-sm font-bold transition-all border-l-4 ${
                isActive
                    ? "bg-black text-white border-black"
                    : "text-gray-500 border-transparent hover:bg-gray-100 hover:text-black"
            }`}
        >
            {icon}
            {label}
        </Link>
    );
};

export default SidebarItem;
