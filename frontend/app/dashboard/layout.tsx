import Sidebar from "@/components/sidebar/Sidebar";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div>
            <Sidebar />
            <main>{children}</main>
        </div>
    );
};

export default DashboardLayout;
