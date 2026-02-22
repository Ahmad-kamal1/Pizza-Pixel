import { useState, useEffect } from "react";
import { Bell, Check, Mail, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAdmin } from "@/context/AdminContext";
import { apiGetContactMessages } from "@/lib/api";

interface ContactMsg {
    id: number;
    name: string;
    email: string;
    message: string;
    read: number | boolean;
    time: string;
}

const timeAgo = (date: Date | string): string => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
};

const NotificationBell = () => {
    const { notifications, unreadCount, markAllRead } = useAdmin();
    const navigate = useNavigate();
    const [messages, setMessages] = useState<ContactMsg[]>([]);
    const [open, setOpen] = useState(false);

    // Load contact messages when dropdown opens
    useEffect(() => {
        if (open) {
            apiGetContactMessages()
                .then(setMessages)
                .catch(() => { });
        }
    }, [open]);

    const unreadMessages = messages.filter(m => !m.read);
    const totalUnread = unreadCount + unreadMessages.length;

    const handleViewMessages = () => {
        setOpen(false);
        navigate("/admin/notifications");
    };

    const handleViewBilling = () => {
        setOpen(false);
        navigate("/admin/billing");
    };

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-9 w-9 rounded-xl border border-border hover:bg-muted"
                    aria-label="Notifications"
                >
                    <Bell className="h-4 w-4 text-foreground" />
                    {totalUnread > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow">
                            {totalUnread > 9 ? "9+" : totalUnread}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                className="w-80 rounded-xl border border-border bg-card p-0 shadow-xl"
                sideOffset={8}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                    <div>
                        <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
                        {totalUnread > 0 && (
                            <p className="text-xs text-muted-foreground">{totalUnread} unread</p>
                        )}
                    </div>
                    <div className="flex items-center gap-1">
                        {unreadCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={markAllRead}
                                className="h-7 gap-1 text-xs text-primary hover:text-primary/80"
                            >
                                <Check className="h-3 w-3" /> Mark all read
                            </Button>
                        )}
                    </div>
                </div>

                <div className="max-h-[380px] overflow-y-auto">
                    {/* ── Contact Messages Section ── */}
                    {messages.length > 0 && (
                        <>
                            <div className="px-4 py-2 bg-muted/30 border-b border-border/50">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                    <Mail className="h-3 w-3" /> Customer Messages
                                </p>
                            </div>
                            {messages.slice(0, 4).map(msg => (
                                <button
                                    key={`msg-${msg.id}`}
                                    onClick={handleViewMessages}
                                    className={`w-full text-left flex items-start gap-3 border-b border-border/40 px-4 py-3 hover:bg-muted/40 transition-colors ${!msg.read ? "bg-primary/5" : ""}`}
                                >
                                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm">
                                        ✉️
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-foreground truncate">{msg.name}</p>
                                        <p className="text-[11px] text-muted-foreground truncate">{msg.message}</p>
                                        <p className="text-[10px] text-muted-foreground/60 mt-0.5">{timeAgo(msg.time)}</p>
                                    </div>
                                    {!msg.read && <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />}
                                </button>
                            ))}
                            {messages.length > 4 && (
                                <button
                                    onClick={handleViewMessages}
                                    className="w-full text-center px-4 py-2 text-xs text-primary font-medium hover:bg-muted/30 border-b border-border/50"
                                >
                                    +{messages.length - 4} more messages → View all
                                </button>
                            )}
                        </>
                    )}

                    {/* ── Order Notifications Section ── */}
                    {notifications.length > 0 && (
                        <>
                            <div className="px-4 py-2 bg-muted/30 border-b border-border/50">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                    <ShoppingBag className="h-3 w-3" /> Order Notifications
                                </p>
                            </div>
                            {notifications.slice(0, 5).map(notif => (
                                <button
                                    key={`notif-${notif.id}`}
                                    onClick={handleViewBilling}
                                    className={`w-full text-left flex items-start gap-3 border-b border-border/40 px-4 py-3 hover:bg-muted/40 transition-colors last:border-0 ${!notif.read ? "bg-primary/5" : ""}`}
                                >
                                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm">
                                        🍕
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-foreground leading-snug">{notif.message}</p>
                                        <p className="text-[10px] text-muted-foreground/60 mt-0.5">{timeAgo(notif.time)}</p>
                                    </div>
                                    {!notif.read && <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                                </button>
                            ))}
                        </>
                    )}

                    {/* Empty state */}
                    {notifications.length === 0 && messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <Bell className="mb-2 h-8 w-8 text-muted-foreground/30" />
                            <p className="text-sm text-muted-foreground">No notifications yet</p>
                            <p className="mt-1 text-xs text-muted-foreground/60">New orders and messages will appear here</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-border p-2 grid grid-cols-2 gap-1">
                    <Button variant="ghost" size="sm" onClick={handleViewMessages} className="text-xs gap-1.5 rounded-lg">
                        <Mail className="h-3.5 w-3.5" /> View Messages
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleViewBilling} className="text-xs gap-1.5 rounded-lg">
                        <ShoppingBag className="h-3.5 w-3.5" /> View Orders
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default NotificationBell;
