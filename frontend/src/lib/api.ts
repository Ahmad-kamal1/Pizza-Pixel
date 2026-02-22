// Relative path — Vite's dev proxy forwards /api/* to localhost:5000
export const API_BASE = "/api";

async function request(path: string, options: RequestInit = {}): Promise<any> {
    const res = await fetch(`${API_BASE}${path}`, {
        headers: { "Content-Type": "application/json", ...options.headers },
        ...options,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Request failed");
    return data;
}

// ── Auth ──────────────────────────────────────────────────
export const apiLogin = (email: string, password: string) =>
    request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });

export const apiRegister = (payload: {
    firstName: string; lastName: string; email: string; password: string;
}) => request("/auth/register", { method: "POST", body: JSON.stringify(payload) });

// ── Profile ───────────────────────────────────────────────
export const apiGetProfile = (email: string) =>
    request(`/profile/${encodeURIComponent(email)}`);

export const apiUpdateProfile = (
    email: string,
    data: { firstName: string; lastName: string; phone?: string; address?: string; avatar?: string }
) => request(`/profile/${encodeURIComponent(email)}`, { method: "PUT", body: JSON.stringify(data) });

export const apiChangePassword = (
    email: string,
    currentPassword: string,
    newPassword: string
) =>
    request(`/profile/${encodeURIComponent(email)}/password`, {
        method: "PUT",
        body: JSON.stringify({ currentPassword, newPassword }),
    });

// ── Categories ────────────────────────────────────────────
export const apiGetCategories = () => request("/categories");

export const apiAddCategory = (cat: {
    name: string; emoji: string; description: string; image?: string;
}) => request("/categories", { method: "POST", body: JSON.stringify(cat) });

export const apiEditCategory = (cat: {
    id: number; name: string; emoji: string; description: string; image?: string;
}) =>
    request(`/categories/${cat.id}`, { method: "PUT", body: JSON.stringify(cat) });

export const apiDeleteCategory = (id: number) =>
    request(`/categories/${id}`, { method: "DELETE" });

// ── Menu Items ────────────────────────────────────────────
export const apiGetItems = () => request("/items");

export const apiAddItem = (item: {
    name: string; description?: string; price: string; image?: string; category?: string;
}) => request("/items", { method: "POST", body: JSON.stringify(item) });

export const apiEditItem = (item: {
    id: number; name: string; description?: string; price: string; image?: string; category?: string;
}) => request(`/items/${item.id}`, { method: "PUT", body: JSON.stringify(item) });

export const apiDeleteItem = (id: number) =>
    request(`/items/${id}`, { method: "DELETE" });

// ── Orders ────────────────────────────────────────────────
export const apiGetOrders = () => request("/orders");

export const apiCreateOrder = (order: {
    customer: string; customerPhone?: string;
    orderItems: { name: string; qty: number; unitPrice: number }[];
    total: number; status?: string; isOnline?: boolean;
}) => request("/orders", { method: "POST", body: JSON.stringify(order) });


export const apiUpdateOrderStatus = (id: number, status: string) =>
    request(`/orders/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });

export const apiGetNotifications = () => request("/orders/notifications");

export const apiMarkNotificationsRead = () =>
    request("/orders/notifications/mark-read", { method: "POST" });

// ── Contact Messages ──────────────────────────────────────
export const apiSubmitContact = (payload: { name: string; email: string; message: string }) =>
    request("/contact", { method: "POST", body: JSON.stringify(payload) });

export const apiGetContactMessages = () => request("/contact");

export const apiGetUserMessages = (email: string) => request(`/contact/user/${encodeURIComponent(email)}`);

export const apiReplyToMessage = (id: number, reply: string) =>
    request(`/contact/${id}/reply`, { method: "PUT", body: JSON.stringify({ reply }) });

export const apiMarkMessageRead = (id: number) =>
    request(`/contact/${id}/read`, { method: "PUT" });
