import { useState } from "react";
import { useAdmin, Order } from "@/context/AdminContext";
import {
    Receipt,
    Plus,
    Search,
    Eye,
    Printer,
    MoreVertical,
    CheckCircle2,
    Clock,
    XCircle,
    Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import InvoiceModal from "../components/InvoiceModal";

const AdminBilling = () => {
    const { orders, items, addManualOrder, updateOrderStatus } = useAdmin();
    const { toast } = useToast();
    const [search, setSearch] = useState("");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    // New Bill Form State
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [selectedItems, setSelectedItems] = useState<{ id: number; qty: number }[]>([]);

    const filteredOrders = orders.filter(o =>
        o.customer.toLowerCase().includes(search.toLowerCase()) ||
        o.invoiceNumber.toLowerCase().includes(search.toLowerCase())
    );

    const handleCreateBill = () => {
        if (!customerName || selectedItems.length === 0) {
            toast({
                title: "Error",
                description: "Please enter customer name and add at least one item.",
                variant: "destructive",
            });
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

        const total = orderItems.reduce((acc, item) => acc + (item.qty * item.unitPrice), 0) * 1.08;

        addManualOrder({
            customer: customerName,
            customerPhone: customerPhone,
            items: orderItems.map(i => i.name),
            orderItems: orderItems,
            total: parseFloat(total.toFixed(2)),
            status: "pending"
        });

        toast({
            title: "Success",
            description: "Manual bill generated successfully.",
        });

        setIsCreateModalOpen(false);
        resetForm();
    };

    const resetForm = () => {
        setCustomerName("");
        setCustomerPhone("");
        setSelectedItems([]);
    };

    const addItemToBill = (itemId: string) => {
        const id = parseInt(itemId);
        setSelectedItems(prev => {
            const existing = prev.find(i => i.id === id);
            if (existing) {
                return prev.map(i => i.id === id ? { ...i, qty: i.qty + 1 } : i);
            }
            return [...prev, { id, qty: 1 }];
        });
    };

    const removeItemFromBill = (id: number) => {
        setSelectedItems(prev => prev.filter(i => i.id !== id));
    };

    const viewInvoice = (order: Order) => {
        setSelectedOrder(order);
        setIsInvoiceOpen(true);
    };

    const getStatusBadge = (status: Order["status"]) => {
        switch (status) {
            case "completed":
                return <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-0">Completed</Badge>;
            case "pending":
                return <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-0">Pending</Badge>;
            case "cancelled":
                return <Badge className="bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border-0">Cancelled</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold text-foreground">Billing & Invoices</h1>
                    <p className="text-sm text-muted-foreground">Manage order payments and generate invoices.</p>
                </div>
                <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2 rounded-xl">
                    <Plus className="h-4 w-4" /> New Manual Bill
                </Button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search invoice or customer..."
                        className="pl-9 rounded-xl"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Billing Table */}
            <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border bg-muted/40">
                                <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Invoice #</th>
                                <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Customer</th>
                                <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Date</th>
                                <th className="px-6 py-4 text-right font-semibold text-muted-foreground">Total</th>
                                <th className="px-6 py-4 text-center font-semibold text-muted-foreground">Status</th>
                                <th className="px-6 py-4 text-right font-semibold text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">
                                        No billing records found.
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr key={order.id} className="border-b border-border/50 transition-colors hover:bg-muted/30 last:border-0">
                                        <td className="px-6 py-4 font-mono text-xs font-bold text-primary">{order.invoiceNumber}</td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-foreground">{order.customer}</div>
                                            {order.customerPhone && <div className="text-xs text-muted-foreground">{order.customerPhone}</div>}
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {format(order.time, "MMM dd, yyyy")}
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-foreground">
                                            ${order.total.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {getStatusBadge(order.status)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-lg"
                                                    onClick={() => viewInvoice(order)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48 rounded-xl">
                                                        <DropdownMenuLabel>Manage Order</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => viewInvoice(order)} className="gap-2">
                                                            <Printer className="h-4 w-4" /> Print Invoice
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => updateOrderStatus(order.id, "completed")}
                                                            className="gap-2 text-emerald-600 focus:text-emerald-600"
                                                        >
                                                            <CheckCircle2 className="h-4 w-4" /> Mark as Paid
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => updateOrderStatus(order.id, "cancelled")}
                                                            className="gap-2 text-rose-600 focus:text-rose-600"
                                                        >
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

            {/* Create Manual Bill Modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Create New Manual Bill</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Customer Name</label>
                                <Input
                                    placeholder="Enter name"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    className="rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Phone (Optional)</label>
                                <Input
                                    placeholder="Enter phone"
                                    value={customerPhone}
                                    onChange={(e) => setCustomerPhone(e.target.value)}
                                    className="rounded-xl"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Select Items</label>
                            <Select onValueChange={addItemToBill}>
                                <SelectTrigger className="rounded-xl">
                                    <SelectValue placeholder="Add menu item..." />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    {items.map(item => (
                                        <SelectItem key={item.id} value={item.id.toString()}>
                                            {item.name} — {item.price}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Selected Items List */}
                        <div className="rounded-xl border border-border p-2 space-y-2 bg-muted/20 max-h-48 overflow-y-auto">
                            {selectedItems.length === 0 ? (
                                <p className="text-center text-xs text-muted-foreground py-4">No items added yet.</p>
                            ) : (
                                selectedItems.map(si => {
                                    const item = items.find(i => i.id === si.id);
                                    return (
                                        <div key={si.id} className="flex items-center justify-between bg-card p-2 rounded-lg border border-border shadow-sm">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold">{item?.name}</span>
                                                <span className="text-xs text-muted-foreground">{item?.price} x {si.qty}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-sm">
                                                    ${(parseFloat((item?.price || "$0").replace("$", "")) * si.qty).toFixed(2)}
                                                </span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 text-rose-500"
                                                    onClick={() => removeItemFromBill(si.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Subtotal Preview */}
                        {selectedItems.length > 0 && (
                            <div className="flex justify-end p-2 text-sm bg-primary/5 rounded-xl border border-primary/10">
                                <div className="text-right">
                                    <p className="text-muted-foreground">Estimated Total (incl. 8% tax):</p>
                                    <p className="text-lg font-black text-primary">
                                        ${(selectedItems.reduce((acc, si) => {
                                            const item = items.find(i => i.id === si.id);
                                            return acc + (parseFloat((item?.price || "$0").replace("$", "")) * si.qty);
                                        }, 0) * 1.08).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} className="rounded-xl">Cancel</Button>
                        <Button onClick={handleCreateBill} className="rounded-xl">Generate Bill</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Invoice Viewer Modal */}
            <InvoiceModal
                order={selectedOrder}
                open={isInvoiceOpen}
                onOpenChange={setIsInvoiceOpen}
            />
        </div>
    );
};

export default AdminBilling;
