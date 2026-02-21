import { useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, Download, Pizza } from "lucide-react";
import { Order } from "@/context/AdminContext";
import { format } from "date-fns";

interface InvoiceModalProps {
    order: Order | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const InvoiceModal = ({ order, open, onOpenChange }: InvoiceModalProps) => {
    const printRef = useRef<HTMLDivElement>(null);

    if (!order) return null;

    const handlePrint = () => {
        window.print();
    };

    const subtotal = order.orderItems.reduce((acc, item) => acc + (item.qty * item.unitPrice), 0);
    const tax = subtotal * 0.08;
    const total = subtotal + tax;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="print:hidden">
                    <DialogTitle>Order Invoice</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-6 p-4 print:p-0" ref={printRef}>
                    {/* Invoice Header */}
                    <div className="flex justify-between items-start border-b pb-6">
                        <div className="flex items-center gap-2">
                            <div className="bg-primary p-2 rounded-lg">
                                <Pizza className="h-6 w-6 text-primary-foreground" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold tracking-tight">PIZZA PIXEL</h2>
                                <p className="text-sm text-muted-foreground">Premium Italian Pizzeria</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <h1 className="text-2xl font-black text-primary">INVOICE</h1>
                            <p className="font-mono text-sm uppercase text-muted-foreground">{order.invoiceNumber}</p>
                        </div>
                    </div>

                    {/* Invoice Details */}
                    <div className="grid grid-cols-2 gap-8 text-sm">
                        <div>
                            <p className="text-muted-foreground font-semibold uppercase text-xs mb-1">Billed To</p>
                            <p className="font-bold text-foreground text-base">{order.customer}</p>
                            {order.customerPhone && <p className="text-muted-foreground">{order.customerPhone}</p>}
                        </div>
                        <div className="text-right">
                            <p className="text-muted-foreground font-semibold uppercase text-xs mb-1">Date</p>
                            <p className="font-bold text-foreground">{format(order.time, "PPP")}</p>
                            <p className="text-muted-foreground">{format(order.time, "pp")}</p>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="rounded-xl border border-border overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-muted/50 border-b">
                                    <th className="px-4 py-3 text-left font-semibold">Description</th>
                                    <th className="px-4 py-3 text-center font-semibold">Qty</th>
                                    <th className="px-4 py-3 text-right font-semibold">Price</th>
                                    <th className="px-4 py-3 text-right font-semibold">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.orderItems.map((item, idx) => (
                                    <tr key={idx} className="border-b last:border-0">
                                        <td className="px-4 py-3">{item.name}</td>
                                        <td className="px-4 py-3 text-center">{item.qty}</td>
                                        <td className="px-4 py-3 text-right">${item.unitPrice.toFixed(2)}</td>
                                        <td className="px-4 py-3 text-right font-medium">
                                            ${(item.qty * item.unitPrice).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals */}
                    <div className="flex justify-end pt-4">
                        <div className="w-64 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="font-medium">${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Tax (8%)</span>
                                <span className="font-medium">${tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between border-t border-border pt-2 text-base font-bold text-primary">
                                <span>TOTAL</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 border-t pt-6 text-center text-xs text-muted-foreground">
                        <p className="font-bold text-foreground">Thank you for dining with us!</p>
                        <p>123 Pizza Street, Foodie City • pizzapixel.com • (555) 123-4567</p>
                    </div>
                </div>

                {/* Print Actions */}
                <div className="flex justify-end gap-3 pt-6 border-t print:hidden">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                    <Button variant="outline" onClick={handlePrint} className="gap-2">
                        <Download className="h-4 w-4" /> Save as PDF
                    </Button>
                    <Button onClick={handlePrint} className="gap-2">
                        <Printer className="h-4 w-4" /> Print Invoice
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default InvoiceModal;
