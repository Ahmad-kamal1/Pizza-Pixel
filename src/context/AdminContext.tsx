import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { menuItems, MenuItem } from "@/data/menuItems";

export interface Category {
    id: number;
    name: string;
    emoji: string;
    description: string;
}

export interface Order {
    id: number;
    customer: string;
    items: string[];
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

const defaultCategories: Category[] = [
    { id: 1, name: "Pizzas", emoji: "🍕", description: "All pizza varieties" },
    { id: 2, name: "Burgers", emoji: "🍔", description: "Juicy burgers & sliders" },
    { id: 3, name: "Rolls", emoji: "🌯", description: "Wraps and rolls" },
    { id: 4, name: "Sandwiches", emoji: "🥪", description: "Classic sandwiches" },
    { id: 5, name: "Drinks", emoji: "🥤", description: "Beverages & shakes" },
    { id: 6, name: "Desserts", emoji: "🍰", description: "Sweets & treats" },
];

const generateOrder = (id: number): Order => {
    const customers = ["Ali Hassan", "Sara Khan", "Omar Sheikh", "Fatima Malik", "Zaid Ahmad"];
    const items = ["Margherita", "Pepperoni", "BBQ Chicken", "Garlic Bread", "Lemonade"];
    return {
        id,
        customer: customers[Math.floor(Math.random() * customers.length)],
        items: [items[Math.floor(Math.random() * items.length)]],
        total: parseFloat((Math.random() * 30 + 10).toFixed(2)),
        status: Math.random() > 0.4 ? "completed" : "pending",
        time: new Date(),
    };
};

const initialOrders: Order[] = Array.from({ length: 8 }, (_, i) =>
    generateOrder(1000 + i)
).map((o, i) => ({
    ...o,
    time: new Date(Date.now() - (8 - i) * 10 * 60 * 1000),
    status: i < 5 ? "completed" : "pending",
}));

interface AdminContextType {
    // Items
    items: MenuItem[];
    addItem: (item: Omit<MenuItem, "id">) => void;
    editItem: (item: MenuItem) => void;
    deleteItem: (id: number) => void;

    // Categories
    categories: Category[];
    addCategory: (cat: Omit<Category, "id">) => void;
    editCategory: (cat: Category) => void;
    deleteCategory: (id: number) => void;

    // Orders
    orders: Order[];

    // Notifications
    notifications: Notification[];
    unreadCount: number;
    markAllRead: () => void;

    // Stats
    stats: {
        totalProducts: number;
        todaySales: number;
        totalRevenue: number;
        completedOrders: number;
        pendingOrders: number;
    };
}

const AdminContext = createContext<AdminContextType | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<MenuItem[]>(menuItems);
    const [categories, setCategories] = useState<Category[]>(defaultCategories);
    const [orders, setOrders] = useState<Order[]>(initialOrders);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [nextOrderId, setNextOrderId] = useState(1010);

    // Simulate new orders every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            const newOrder = generateOrder(nextOrderId);
            setOrders(prev => [newOrder, ...prev]);
            const notif: Notification = {
                id: Date.now(),
                message: `New order #${newOrder.id} from ${newOrder.customer} — $${newOrder.total}`,
                time: new Date(),
                read: false,
                orderId: newOrder.id,
            };
            setNotifications(prev => [notif, ...prev]);
            setNextOrderId(prev => prev + 1);
        }, 30000);
        return () => clearInterval(interval);
    }, [nextOrderId]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAllRead = () =>
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));

    // Items CRUD
    const addItem = (item: Omit<MenuItem, "id">) =>
        setItems(prev => [...prev, { ...item, id: Date.now() }]);

    const editItem = (item: MenuItem) =>
        setItems(prev => prev.map(i => (i.id === item.id ? item : i)));

    const deleteItem = (id: number) =>
        setItems(prev => prev.filter(i => i.id !== id));

    // Categories CRUD
    const addCategory = (cat: Omit<Category, "id">) =>
        setCategories(prev => [...prev, { ...cat, id: Date.now() }]);

    const editCategory = (cat: Category) =>
        setCategories(prev => prev.map(c => (c.id === cat.id ? cat : c)));

    const deleteCategory = (id: number) =>
        setCategories(prev => prev.filter(c => c.id !== id));

    const completedOrders = orders.filter(o => o.status === "completed").length;
    const pendingOrders = orders.filter(o => o.status === "pending").length;
    const todaySales = orders.filter(o => {
        const today = new Date();
        return (
            o.time.getDate() === today.getDate() &&
            o.time.getMonth() === today.getMonth()
        );
    }).length;
    const totalRevenue = orders
        .filter(o => o.status === "completed")
        .reduce((sum, o) => sum + o.total, 0);

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
