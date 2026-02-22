import { useState } from "react";
import { useAdmin, Order } from "@/context/AdminContext";
import {
    Receipt, Plus, Search, Eye, Printer, MoreVertical,
    CheckCircle2, Clock, XCircle, Trash2, ShoppingBag, Store
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import InvoiceModal from "../components/InvoiceModal";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
        case "completed": return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200 text-xs gap-1"><CheckCircle2 className="h-3 w-3" />Paid</Badge>;
        case "pending": return <Badge className="bg-amber-500/10 text-amber-600 border-amber-200 text-xs gap-1"><Clock className="h-3 w-3" />Pending</Badge>;
        case "cancelled": return <Badge className="bg-rose-500/10 text-rose-600 border-rose-200 text-xs gap-1"><XCircle className="h-3 w-3" />Cancelled</Badge>;
        default: return null;
    }
};

// ─── Orders Table — defined OUTSIDE so React doesn't remount on each render ──
interface OrdersTableProps {
    orderList: Order[];
    onView: (o: Order) => void;
    onPrint: (o: Order) => void;
    onStatus: (id: number, s: Order["status"]) => void;
}

const OrdersTable = ({ orderList, onView, onPrint, onStatus }: OrdersTableProps) => (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-border bg-muted/40">
                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Invoice #</th>
                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Customer</th>
                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Items</th>
                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Date</th>
                        <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Total</th>
                        <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</th>
                        <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {orderList.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="px-6 py-14 text-center">
                                <Receipt className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
                                <p className="text-muted-foreground">No records found.</p>
                            </td>
                        </tr>
                    ) : (
                        orderList.map(order => (
                            <tr key={order.id} className="border-b border-border/50 transition-colors hover:bg-muted/30 last:border-0">
                                <td className="px-5 py-4 font-mono text-xs font-bold text-primary">{order.invoiceNumber}</td>
                                <td className="px-5 py-4">
                                    <div className="font-semibold text-foreground">{order.customer}</div>
                                    {order.customerPhone && <div className="text-xs text-muted-foreground">{order.customerPhone}</div>}
                                </td>
                                <td className="px-5 py-4 max-w-[180px]">
                                    <p className="truncate text-xs text-muted-foreground" title={order.items.join(", ")}>
                                        {order.items.slice(0, 3).join(", ")}
                                        {order.items.length > 3 ? ` +${order.items.length - 3} more` : ""}
                                    </p>
                                </td>
                                <td className="px-5 py-4 text-xs text-muted-foreground whitespace-nowrap">
                                    {format(order.time, "MMM dd, yyyy")}
                                    <div className="text-muted-foreground/60">{format(order.time, "hh:mm a")}</div>
                                </td>
                                <td className="px-5 py-4 text-right font-bold text-foreground">${order.total.toFixed(2)}</td>
                                <td className="px-5 py-4 text-center">{getStatusBadge(order.status)}</td>
                                <td className="px-5 py-4 text-right">
                                    <div className="flex justify-end gap-1.5">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" title="View Invoice" onClick={() => onView(order)}>
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-primary" title="Print" onClick={() => onPrint(order)}>
                                            <Printer className="h-4 w-4" />
                                        </Button>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48 rounded-xl">
                                                <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => onStatus(order.id, "completed")} className="gap-2 text-emerald-600 focus:text-emerald-600">
                                                    <CheckCircle2 className="h-4 w-4" /> Mark as Paid
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => onStatus(order.id, "pending")} className="gap-2 text-amber-600 focus:text-amber-600">
                                                    <Clock className="h-4 w-4" /> Mark as Pending
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => onStatus(order.id, "cancelled")} className="gap-2 text-rose-600 focus:text-rose-600">
                                                    <XCircle className="h-4 w-4" /> Cancel Bill
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    </div>
);

// ─── Main Page ─────────────────────────────────────────────────────────────────
const AdminBilling = () => {
    const { orders, items, addManualOrder, updateOrderStatus } = useAdmin();
    const { toast } = useToast();

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | Order["status"]>("all");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    // Manual bill form
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [tableNumber, setTableNumber] = useState("");
    const [selectedItems, setSelectedItems] = useState<{ id: number; qty: number }[]>([]);

    // Filtering
    const filtered = orders.filter(o => {
        const matchSearch =
            o.customer.toLowerCase().includes(search.toLowerCase()) ||
            o.invoiceNumber.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === "all" || o.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const manualOrders = filtered.filter(o => !(o as any).isOnline);
    const onlineOrders = filtered.filter(o => !!(o as any).isOnline);

    // Handlers
    const viewInvoice = (order: Order) => { setSelectedOrder(order); setIsInvoiceOpen(true); };

    const handleCreateBill = async () => {
        if (!customerName.trim() || selectedItems.length === 0) {
            toast({ title: "Customer name and at least one item required.", variant: "destructive" });
            return;
        }
        const orderItems = selectedItems.map(si => {
            const item = items.find(i => i.id === si.id);
            return {
                name: item?.name || "Unknown",
                qty: si.qty,
                unitPrice: parseFloat((item?.price || "$0").replace("$", ""))
            };
        });
        const subtotal = orderItems.reduce((a, i) => a + i.qty * i.unitPrice, 0);
        const total = subtotal * 1.08;
        try {
            await addManualOrder({
                customer: customerName.trim() + (tableNumber ? ` (Table ${tableNumber})` : ""),
                customerPhone,
                items: orderItems.map(i => i.name),
                orderItems,
                total: parseFloat(total.toFixed(2)),
                status: "pending",
            });
            toast({ title: "✅ Bill generated!", description: `Total: $${total.toFixed(2)}` });
            setIsCreateOpen(false);
            resetForm();
        } catch (err: any) {
            toast({ title: "Failed to create bill", description: err.message, variant: "destructive" });
        }
    };

    const resetForm = () => { setCustomerName(""); setCustomerPhone(""); setTableNumber(""); setSelectedItems([]); };

    const addItem = (itemId: string) => {
        const id = parseInt(itemId);
        setSelectedItems(prev => {
            const e = prev.find(i => i.id === id);
            return e ? prev.map(i => i.id === id ? { ...i, qty: i.qty + 1 } : i) : [...prev, { id, qty: 1 }];
        });
    };
    const changeQty = (id: number, delta: number) =>
        setSelectedItems(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i));
    const removeItem = (id: number) => setSelectedItems(prev => prev.filter(i => i.id !== id));

    const billSubtotal = selectedItems.reduce((a, si) => {
        const item = items.find(i => i.id === si.id);
        return a + parseFloat((item?.price || "$0").replace("$", "")) * si.qty;
    }, 0);

    const statCards = [
        { label: "Total Bills", value: orders.length, color: "text-primary", bg: "bg-primary/10", Icon: Receipt },
        { label: "Paid / Completed", value: orders.filter(o => o.status === "completed").length, color: "text-emerald-600", bg: "bg-emerald-50", Icon: CheckCircle2 },
        { label: "Pending", value: orders.filter(o => o.status === "pending").length, color: "text-amber-600", bg: "bg-amber-50", Icon: Clock },
        { label: "Total Revenue", value: `$${orders.filter(o => o.status === "completed").reduce((s, o) => s + o.total, 0).toFixed(2)}`, color: "text-blue-600", bg: "bg-blue-50", Icon: Receipt },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold text-foreground">Billing & Invoices</h1>
                    <p className="text-sm text-muted-foreground">Generate, print, and manage all orders and bills.</p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)} className="gap-2 rounded-xl">
                    <Plus className="h-4 w-4" /> New Manual Bill
                </Button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {statCards.map(card => (
                    <div key={card.label} className="rounded-2xl border border-border bg-card p-4 shadow-sm flex items-center gap-3">
                        <div className={`${card.bg} rounded-xl p-2.5 flex-shrink-0`}>
                            <card.Icon className={`h-5 w-5 ${card.color}`} />
                        </div>
                        <div>
                            <p className="text-[11px] text-muted-foreground font-medium">{card.label}</p>
                            <p className={`text-xl font-black ${card.color}`}>{card.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Search invoice or customer..." className="pl-9 rounded-xl" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
                    <SelectTrigger className="w-40 rounded-xl">
                        <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="completed">Completed / Paid</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="all">
                <TabsList className="mb-4 rounded-xl">
                    <TabsTrigger value="all" className="gap-2 rounded-lg">
                        <Receipt className="h-4 w-4" /> All ({filtered.length})
                    </TabsTrigger>
                    <TabsTrigger value="manual" className="gap-2 rounded-lg">
                        <Store className="h-4 w-4" /> In-Store ({manualOrders.length})
                    </TabsTrigger>
                    <TabsTrigger value="online" className="gap-2 rounded-lg">
                        <ShoppingBag className="h-4 w-4" /> Online ({onlineOrders.length})
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="all">
                    <OrdersTable orderList={filtered} onView={viewInvoice} onPrint={viewInvoice} onStatus={updateOrderStatus} />
                </TabsContent>
                <TabsContent value="manual">
                    <OrdersTable orderList={manualOrders} onView={viewInvoice} onPrint={viewInvoice} onStatus={updateOrderStatus} />
                </TabsContent>
                <TabsContent value="online">
                    <OrdersTable orderList={onlineOrders} onView={viewInvoice} onPrint={viewInvoice} onStatus={updateOrderStatus} />
                </TabsContent>
            </Tabs>

            {/* Create Bill Modal */}
            <Dialog open={isCreateOpen} onOpenChange={v => { setIsCreateOpen(v); if (!v) resetForm(); }}>
                <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Store className="h-5 w-5 text-primary" /> Create In-Store Bill
                        </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-2">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Customer Name *</label>
                                <Input placeholder="e.g. John Doe" value={customerName} onChange={e => setCustomerName(e.target.value)} className="rounded-xl" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Phone (Optional)</label>
                                <Input placeholder="+92 300 0000000" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="rounded-xl" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Table Number (Optional)</label>
                            <Input placeholder="e.g. 5" value={tableNumber} onChange={e => setTableNumber(e.target.value)} className="rounded-xl max-w-[130px]" />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Add Menu Item</label>
                            <Select onValueChange={addItem}>
                                <SelectTrigger className="rounded-xl">
                                    <SelectValue placeholder="Select a menu item..." />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl max-h-56">
                                    {items.length === 0
                                        ? <div className="px-3 py-4 text-center text-sm text-muted-foreground">No items in menu</div>
                                        : items.map(item => (
                                            <SelectItem key={item.id} value={item.id.toString()}>
                                                {item.name} — {item.price}
                                            </SelectItem>
                                        ))
                                    }
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Selected items list */}
                        <div className="rounded-xl border border-border bg-muted/20 min-h-[60px] max-h-52 overflow-y-auto">
                            {selectedItems.length === 0 ? (
                                <p className="text-center text-xs text-muted-foreground py-5">No items added yet.</p>
                            ) : (
                                <div className="divide-y divide-border">
                                    {selectedItems.map(si => {
                                        const item = items.find(i => i.id === si.id);
                                        const price = parseFloat((item?.price || "$0").replace("$", ""));
                                        return (
                                            <div key={si.id} className="flex items-center justify-between px-4 py-3">
                                                <div>
                                                    <p className="font-semibold text-sm text-foreground">{item?.name}</p>
                                                    <p className="text-xs text-muted-foreground">{item?.price} each</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => changeQty(si.id, -1)} className="h-7 w-7 rounded-lg bg-muted hover:bg-muted/80 font-bold text-sm flex items-center justify-center">−</button>
                                                    <span className="font-bold text-sm w-5 text-center">{si.qty}</span>
                                                    <button onClick={() => changeQty(si.id, 1)} className="h-7 w-7 rounded-lg bg-muted hover:bg-muted/80 font-bold text-sm flex items-center justify-center">+</button>
                                                    <span className="font-bold text-sm text-primary w-16 text-right">${(price * si.qty).toFixed(2)}</span>
                                                    <button onClick={() => removeItem(si.id)} className="text-rose-500 hover:text-rose-600 ml-1">
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Summary */}
                        {selectedItems.length > 0 && (
                            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-1.5 text-sm">
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Subtotal</span><span>${billSubtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Tax (8%)</span><span>${(billSubtotal * 0.08).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-black text-primary text-base border-t border-primary/20 pt-1.5">
                                    <span>TOTAL</span><span>${(billSubtotal * 1.08).toFixed(2)}</span>
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setIsCreateOpen(false); resetForm(); }} className="rounded-xl">Cancel</Button>
                        <Button onClick={handleCreateBill} className="rounded-xl gap-2" disabled={!customerName.trim() || selectedItems.length === 0}>
                            <Receipt className="h-4 w-4" /> Generate Bill
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Invoice Modal */}
            <InvoiceModal order={selectedOrder} open={isInvoiceOpen} onOpenChange={setIsInvoiceOpen} />
        </div>
    );
};

export default AdminBilling;
