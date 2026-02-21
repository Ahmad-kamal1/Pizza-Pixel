import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Menu, Pizza, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AdminSidebar from "./AdminSidebar";
import NotificationBell from "./components/NotificationBell";

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const navigate = useNavigate();

    return (
        <div className="flex min-h-screen bg-background">
            {/* Sidebar */}
            <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(o => !o)} />

            {/* Main content */}
            <div
                className="flex flex-1 flex-col transition-all duration-300"
                style={{ marginLeft: sidebarOpen ? "240px" : "72px" }}
            >
                {/* Top Header */}
                <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 px-6 shadow-sm backdrop-blur">
                    {/* Left: hamburger + breadcrumb */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(o => !o)}
                            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            aria-label="Toggle sidebar"
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                        <div className="flex items-center gap-2">
                            <Pizza className="h-5 w-5 text-primary" />
                            <span className="text-lg font-bold text-foreground">
                                Pizza <span className="text-primary">Pixel</span>{" "}
                                <span className="ml-1 text-sm font-medium text-muted-foreground">Admin</span>
                            </span>
                        </div>
                    </div>

                    {/* Right: notifications + avatar */}
                    <div className="flex items-center gap-3">
                        <NotificationBell />

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 rounded-full border border-border bg-muted"
                                >
                                    <User className="h-4 w-4 text-foreground" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <div className="px-3 py-2">
                                    <p className="text-sm font-semibold text-foreground">Admin User</p>
                                    <p className="text-xs text-muted-foreground">admin@pizzapixel.com</p>
                                </div>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="cursor-pointer text-destructive focus:text-destructive"
                                    onClick={() => navigate("/")}
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Back to Site
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
