import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
    apiGetItems,
    apiAddItem,
    apiEditItem,
    apiDeleteItem,
    apiGetCategories,
    apiAddCategory,
    apiEditCategory,
    apiDeleteCategory,
    apiGetOrders,
    apiCreateOrder,
    apiUpdateOrderStatus,
    apiGetNotifications,
    apiMarkNotificationsRead,
} from "@/lib/api";

export interface Category {
    id: number;
    name: string;
    emoji: string;
    description: string;
    image?: string;
}

export interface MenuItem {
    id: number;
    name: string;
    description: string;
    price: string;
    image: string;
    category?: string;
}

export interface Order {
    id: number;
    invoiceNumber: string;
    customer: string;
    customerPhone?: string;
    items: string[];
    orderItems: { name: string; qty: number; unitPrice: number }[];
    total: number;
    status: "pending" | "completed" | "cancelled";
    time: Date;
}

export interface Notification {
    id: number;
    message: string;
    time: Date;
    read: boolean;
    orderId: number;
}

interface AdminContextType {
    items: MenuItem[];
    addItem: (item: Omit<MenuItem, "id">) => Promise<void>;
    editItem: (item: MenuItem) => Promise<void>;
    deleteItem: (id: number) => Promise<void>;

    categories: Category[];
    addCategory: (cat: Omit<Category, "id">) => Promise<void>;
    editCategory: (cat: Category) => Promise<void>;
    deleteCategory: (id: number) => Promise<void>;

    orders: Order[];
    addManualOrder: (order: Omit<Order, "id" | "invoiceNumber" | "time">) => Promise<void>;
    updateOrderStatus: (id: number, status: Order["status"]) => Promise<void>;

    notifications: Notification[];
    unreadCount: number;
    markAllRead: () => Promise<void>;

    stats: {
        totalProducts: number;
        todaySales: number;
        totalRevenue: number;
        completedOrders: number;
        pendingOrders: number;
    };

    loading: boolean;
}

const AdminContext = createContext<AdminContextType | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<MenuItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    // Safely parse an order row coming from the API
    const parseOrder = (o: any): Order => {
        // Parse orderItems: MySQL stores JSON as a string
        let orderItems: { name: string; qty: number; unitPrice: number }[] = [];
        if (Array.isArray(o.orderItems)) {
            orderItems = o.orderItems;
        } else if (typeof o.orderItems === "string") {
            try { orderItems = JSON.parse(o.orderItems); } catch (_) { orderItems = []; }
        }

        // Parse items (display names list)
        let parsedItems: string[] = [];
        if (Array.isArray(o.items)) {
            parsedItems = o.items;
        } else if (typeof o.items === "string") {
            try {
                const p = JSON.parse(o.items);
                parsedItems = Array.isArray(p) ? p : [o.items];
            } catch (_) { parsedItems = [o.items]; }
        } else {
            parsedItems = orderItems.map((oi) => oi.name);
        }

        return {
            ...o,
            items: parsedItems,
            orderItems,
            total: Number(o.total) || 0,
            time: o.time instanceof Date ? o.time : new Date(o.time),
        };
    };

    // Load everything from the API on mount
    useEffect(() => {
        const loadAll = async () => {
            try {
                const [itemsData, catsData, ordersData, notifsData] = await Promise.all([
                    apiGetItems(),
                    apiGetCategories(),
                    apiGetOrders(),
                    apiGetNotifications(),
                ]);
                setItems(itemsData);
                setCategories(catsData);
                setOrders(ordersData.map(parseOrder));
                setNotifications(
                    notifsData.map((n: any) => ({ ...n, time: new Date(n.time) }))
                );
            } catch (err) {
                console.error("Failed to load data from API:", err);
            } finally {
                setLoading(false);
            }
        };
        loadAll();
    }, []);

    // Poll for new notifications every 30 seconds
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const [newOrders, newNotifs] = await Promise.all([
                    apiGetOrders(),
                    apiGetNotifications(),
                ]);
                setOrders(newOrders.map(parseOrder));
                setNotifications(newNotifs.map((n: any) => ({ ...n, time: new Date(n.time) })));
            } catch (_) { }
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    // ── Items ──────────────────────────────────────────────────────────────
    const addItem = async (item: Omit<MenuItem, "id">) => {
        const created = await apiAddItem(item);
        setItems((prev) => [...prev, created]);
    };

    const editItem = async (item: MenuItem) => {
        const updated = await apiEditItem(item);
        setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    };

    const deleteItem = async (id: number) => {
        await apiDeleteItem(id);
        setItems((prev) => prev.filter((i) => i.id !== id));
    };

    // ── Categories ─────────────────────────────────────────────────────────
    const addCategory = async (cat: Omit<Category, "id">) => {
        const created = await apiAddCategory(cat);
        setCategories((prev) => [...prev, created]);
    };

    const editCategory = async (cat: Category) => {
        const updated = await apiEditCategory(cat);
        setCategories((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    };

    const deleteCategory = async (id: number) => {
        await apiDeleteCategory(id);
        setCategories((prev) => prev.filter((c) => c.id !== id));
    };

    // ── Orders ─────────────────────────────────────────────────────────────
    const addManualOrder = async (orderData: Omit<Order, "id" | "invoiceNumber" | "time">) => {
        const created = await apiCreateOrder({
            customer: orderData.customer,
            customerPhone: orderData.customerPhone,
            orderItems: orderData.orderItems,
            total: orderData.total,
            status: orderData.status,
        });
        setOrders((prev) => [{ ...created, time: new Date(created.time) }, ...prev]);
    };

    const updateOrderStatus = async (id: number, status: Order["status"]) => {
        await apiUpdateOrderStatus(id, status);
        setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    };

    // ── Notifications ──────────────────────────────────────────────────────
    const unreadCount = notifications.filter((n) => !n.read).length;

    const markAllRead = async () => {
        await apiMarkNotificationsRead();
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    };

    // ── Stats ──────────────────────────────────────────────────────────────
    const completedOrders = orders.filter((o) => o.status === "completed").length;
    const pendingOrders = orders.filter((o) => o.status === "pending").length;
    const todaySales = orders.filter((o) => {
        const today = new Date();
        return (
            o.time.getDate() === today.getDate() &&
            o.time.getMonth() === today.getMonth()
        );
    }).length;
    const totalRevenue = orders
        .filter((o) => o.status === "completed")
        .reduce((sum, o) => sum + Number(o.total), 0);

    return (
        <AdminContext.Provider
            value={{
                items,
                addItem,
                editItem,
                deleteItem,
                categories,
                addCategory,
                editCategory,
                deleteCategory,
                orders,
                addManualOrder,
                updateOrderStatus,
                notifications,
                unreadCount,
                markAllRead,
                stats: {
                    totalProducts: items.length,
                    todaySales,
                    totalRevenue,
                    completedOrders,
                    pendingOrders,
                },
                loading,
            }}
        >
            {children}
        </AdminContext.Provider>
    );
}

export function useAdmin() {
    const ctx = useContext(AdminContext);
    if (!ctx) throw new Error("useAdmin must be used inside AdminProvider");
    return ctx;
}
