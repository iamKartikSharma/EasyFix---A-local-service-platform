"use client";
import Link from "next/link";
import {
    Home,
    Search,
    Calendar,
    MessageSquare,
    User,
    Settings,
    LogOut,
    Menu,
    X
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function CustomerDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [userName, setUserName] = useState("Customer");
    const [userEmail, setUserEmail] = useState("");
    const [userInitials, setUserInitials] = useState("C");
    const pathname = usePathname();
    const supabase = createClient();

    useEffect(() => {
        const fetchUserProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserEmail(user.email || "");

                const { data: profile } = await supabase
                    .from('profiles')
                    .select('full_name')
                    .eq('id', user.id)
                    .single();

                if (profile && profile.full_name) {
                    setUserName(profile.full_name);
                    // Generate initials
                    const names = profile.full_name.split(' ');
                    if (names.length >= 2) {
                        setUserInitials(`${names[0][0]}${names[names.length - 1][0]}`.toUpperCase());
                    } else {
                        setUserInitials(profile.full_name.substring(0, 2).toUpperCase());
                    }
                }
            }
        };
        fetchUserProfile();
    }, []);

    const navigation = [
        { name: "Find Services", href: "/dashboard/customer", icon: Search },
        { name: "My Bookings", href: "/dashboard/customer/bookings", icon: Calendar },
        { name: "Profile", href: "/dashboard/customer/profile", icon: User },
    ];

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="min-h-screen bg-muted/40 flex">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-border transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <div className="h-full flex flex-col">
                    {/* Sidebar Header */}
                    <div className="h-16 flex items-center px-6 border-b border-border">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
                                <Search className="h-5 w-5" />
                            </div>
                            <span className="font-bold text-lg text-foreground">ServicePro</span>
                        </Link>
                        <button
                            onClick={toggleSidebar}
                            className="ml-auto md:hidden text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                        }`}
                                >
                                    <item.icon className="h-5 w-5" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Profile / Logout */}
                    <div className="p-4 border-t border-border">
                        <div className="flex items-center gap-3 px-3 py-2 mb-2">
                            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                {userInitials}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">
                                    {userName}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                    {userEmail}
                                </p>
                            </div>
                        </div>
                        <Link
                            href="/login"
                            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        >
                            <LogOut className="h-5 w-5" />
                            Sign Out
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile Header */}
                <div className="md:hidden flex items-center justify-between h-16 px-4 bg-white border-b border-border">
                    <button
                        onClick={toggleSidebar}
                        className="text-muted-foreground hover:text-foreground focus:outline-none"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                    <span className="font-bold text-lg text-foreground">Overview</span>
                    <div className="w-6" /> {/* Spacer for centering */}
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
