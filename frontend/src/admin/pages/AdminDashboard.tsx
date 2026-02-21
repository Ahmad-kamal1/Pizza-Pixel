import { useAdmin } from "@/context/AdminContext";
import {
    Package,
    ShoppingBag,
    DollarSign,
    CheckCircle,
    Clock,
    TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const AdminDashboard = () => {
    const { stats, orders } = useAdmin();

    const statCards = [
        {
            label: "Total Products",
            value: stats.totalProducts,
            icon: Package,
            color: "text-orange-500",
            bg: "bg-orange-500/10",
            suffix: "",
        },
        {
            label: "Today's Sales",
            value: stats.todaySales,
            icon: ShoppingBag,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            suffix: " orders",
        },
        {
            label: "Total Revenue",
            value: stats.totalRevenue.toFixed(2),
            icon: DollarSign,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            prefix: "$",
        },
        {
            label: "Completed Orders",
            value: stats.completedOrders,
            icon: CheckCircle,
            color: "text-purple-500",
            bg: "bg-purple-500/10",
            suffix: "",
        },
        {
            label: "Pending Orders",
            value: stats.pendingOrders,
            icon: Clock,
            color: "text-rose-500",
            bg: "bg-rose-500/10",
            suffix: "",
        },
    ];

    const recentOrders = orders.slice(0, 6);

    const statusBadge = (status: string) => {
        if (status === "completed")
            return (
                <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-0">
                    Completed
                </Badge>
            );
        if (status === "pending")
            return (
                <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-0">
                    Pending
                </Badge>
            );
        return (
            <Badge className="bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border-0">
                Cancelled
            </Badge>
        );
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    return (
        <div className="space-y-8">
            {/* Welcome */}
            <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-2xl">
                    🍕
                </div>
                <div>
                    <h1 className="text-2xl font-extrabold text-foreground">Welcome back, Admin! 👋</h1>
                    <p className="text-sm text-muted-foreground">
                        Here's what's happening at Pizza Pixel today.
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {statCards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <div
                            key={card.label}
                            className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
                        >
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    {card.label}
                                </p>
                                <div className={`rounded-xl p-2 ${card.bg}`}>
                                    <Icon className={`h-4 w-4 ${card.color}`} />
                                </div>
                            </div>
                            <p className="mt-3 text-3xl font-extrabold text-foreground">
                                {card.prefix ?? ""}
                                {card.value}
                                <span className="text-base font-medium text-muted-foreground">
                                    {card.suffix ?? ""}
                                </span>
                            </p>
                            <div className={`mt-2 flex items-center gap-1 text-xs ${card.color}`}>
                                <TrendingUp className="h-3 w-3" />
                                <span>Live data</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Recent Orders */}
            <div className="rounded-2xl border border-border bg-card shadow-sm">
                <div className="flex items-center justify-between border-b border-border px-6 py-4">
                    <h2 className="text-base font-bold text-foreground">Recent Orders</h2>
                    <Badge variant="outline" className="text-xs text-muted-foreground">
                        Last {recentOrders.length} orders
                    </Badge>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border bg-muted/40">
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Order ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Customer
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Items
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Total
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Time
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentOrders.map((order) => (
                                <tr
                                    key={order.id}
                                    className="border-b border-border/50 transition-colors hover:bg-muted/30 last:border-0"
                                >
                                    <td className="px-6 py-3 font-mono font-medium text-foreground">
                                        #{order.id || (order as any).invoiceNumber}
                                    </td>
                                    <td className="px-6 py-3 text-foreground">{order.customer}</td>
                                    <td className="px-6 py-3 text-muted-foreground">
                                        {order.items.join(", ")}
                                    </td>
                                    <td className="px-6 py-3 font-semibold text-foreground">
                                        ${Number(order.total).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-3 text-muted-foreground">
                                        {formatTime(order.time)}
                                    </td>
                                    <td className="px-6 py-3">{statusBadge(order.status)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
