import { Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAdmin } from "@/context/AdminContext";
const formatDistanceToNow = (date: Date): string => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hr ago`;
    return `${Math.floor(hours / 24)} day ago`;
};

const NotificationBell = () => {
    const { notifications, unreadCount, markAllRead } = useAdmin();

    const formatTime = (date: Date) => formatDistanceToNow(date);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-9 w-9 rounded-xl border border-border hover:bg-muted"
                    aria-label="Notifications"
                >
                    <Bell className="h-4 w-4 text-foreground" />
                    {unreadCount > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow">
                            {unreadCount > 9 ? "9+" : unreadCount}
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
                        {unreadCount > 0 && (
                            <p className="text-xs text-muted-foreground">{unreadCount} unread</p>
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
                                <Check className="h-3 w-3" />
                                Mark all read
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="h-7 text-xs text-primary hover:text-primary/80"
                        >
                            <Link to="/admin/notifications">View all</Link>
                        </Button>
                    </div>
                </div>

                {/* Notification list */}
                <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <Bell className="mb-2 h-8 w-8 text-muted-foreground/30" />
                            <p className="text-sm text-muted-foreground">No notifications yet</p>
                            <p className="mt-1 text-xs text-muted-foreground/60">
                                New orders will appear here
                            </p>
                        </div>
                    ) : (
                        notifications.slice(0, 15).map((notif) => (
                            <div
                                key={notif.id}
                                className={`flex items-start gap-3 border-b border-border/50 px-4 py-3 last:border-0 ${!notif.read ? "bg-primary/5" : ""
                                    }`}
                            >
                                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-base">
                                    🍕
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium leading-snug text-foreground">
                                        {notif.message}
                                    </p>
                                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                                        {formatTime(notif.time)}
                                    </p>
                                </div>
                                {!notif.read && (
                                    <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                                )}
                            </div>
                        ))
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default NotificationBell;
