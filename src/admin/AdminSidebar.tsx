import { NavLink } from "react-router-dom";
import { LayoutDashboard, Package, FolderOpen, ChevronLeft, ChevronRight, Pizza, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
    isOpen: boolean;
    onToggle: () => void;
}

const navItems = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/admin/items", label: "Items", icon: Package },
    { to: "/admin/categories", label: "Categories", icon: FolderOpen },
    { to: "/admin/billing", label: "Billing", icon: Receipt },
];

const AdminSidebar = ({ isOpen, onToggle }: AdminSidebarProps) => {
    return (
        <aside
            className={cn(
                "fixed left-0 top-0 z-40 flex h-full flex-col border-r border-border bg-card shadow-md transition-all duration-300",
                isOpen ? "w-60" : "w-[72px]"
            )}
        >
            {/* Logo */}
            <div
                className={cn(
                    "flex h-16 items-center border-b border-border px-4 gap-3",
                    !isOpen && "justify-center px-0"
                )}
            >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary shadow">
                    <Pizza className="h-5 w-5 text-primary-foreground" />
                </div>
                {isOpen && (
                    <span className="text-lg font-extrabold tracking-tight text-foreground">
                        Pizza<span className="text-primary">Pixel</span>
                    </span>
                )}
            </div>

            {/* Nav links */}
            <nav className="flex flex-1 flex-col gap-1 p-3">
                {navItems.map(({ to, label, icon: Icon, end }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={end}
                        className={({ isActive }) =>
                            cn(
                                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                isActive
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                !isOpen && "justify-center px-0 py-3"
                            )
                        }
                        title={!isOpen ? label : undefined}
                    >
                        <Icon className="h-5 w-5 shrink-0" />
                        {isOpen && <span>{label}</span>}
                    </NavLink>
                ))}
            </nav>

            {/* Collapse Toggle */}
            <div className={cn("border-t border-border p-3", !isOpen && "flex justify-center")}>
                <button
                    onClick={onToggle}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    title={isOpen ? "Collapse sidebar" : "Expand sidebar"}
                >
                    {isOpen ? (
                        <>
                            <ChevronLeft className="h-5 w-5 shrink-0" />
                            <span>Collapse</span>
                        </>
                    ) : (
                        <ChevronRight className="h-5 w-5 shrink-0" />
                    )}
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
