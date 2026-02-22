import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Printer, Download, Pizza, X, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Order } from "@/context/AdminContext";

interface InvoiceModalProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ── Safe date formatter ──────────────────────────────────────────────────────
function safeFormat(dateVal: Date | string | null | undefined, type: "date" | "time"): string {
  try {
    const d = dateVal instanceof Date ? dateVal : new Date(dateVal as string);
    if (isNaN(d.getTime())) return "—";
    if (type === "date") return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "—";
  }
}

// ── Invoice HTML for print/PDF window ───────────────────────────────────────
function buildInvoiceHTML(order: Order): string {
  const items = Array.isArray(order.orderItems) ? order.orderItems : [];
  const subtotal = items.reduce((a, i) => a + (Number(i.qty) || 0) * (Number(i.unitPrice) || 0), 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;
  const isOnline = !!(order as any).isOnline;

  const rowsHTML = items.map(item => `
        <tr>
            <td class="item-name">${item.name}</td>
            <td style="text-align:center">${item.qty}</td>
            <td style="text-align:right">$${Number(item.unitPrice).toFixed(2)}</td>
            <td style="text-align:right;font-weight:700">$${(Number(item.qty) * Number(item.unitPrice)).toFixed(2)}</td>
        </tr>`).join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>Invoice ${order.invoiceNumber || ""}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Segoe UI',Arial,sans-serif;color:#1a1a1a;background:#fff;padding:40px}
    .wrap{max-width:700px;margin:0 auto}
    .header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #f97316;padding-bottom:20px;margin-bottom:24px}
    .brand-name{font-size:22px;font-weight:900;color:#1a1a1a}
    .brand-sub{font-size:12px;color:#888;margin-top:2px}
    .inv-title{font-size:36px;font-weight:900;color:#f97316;letter-spacing:3px}
    .inv-num{font-family:monospace;font-size:12px;color:#888;margin-top:4px;text-align:right}
    .info{display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px;background:#fafafa;padding:18px 22px;border-radius:10px;margin-bottom:24px;border:1px solid #eee}
    .info label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#aaa;display:block;margin-bottom:3px}
    .info p{font-size:14px;font-weight:600;color:#1a1a1a}
    .info .sub{font-size:12px;color:#888;font-weight:400;margin-top:2px}
    .badge{display:inline-block;padding:2px 10px;border-radius:20px;font-size:11px;font-weight:700}
    .badge-online{background:#dbeafe;color:#2563eb}
    .badge-manual{background:#f3e8ff;color:#7c3aed}
    table{width:100%;border-collapse:collapse;margin-bottom:22px}
    thead tr{background:#f97316;color:#fff}
    th{padding:11px 14px;text-align:left;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px}
    th:last-child,td:last-child{text-align:right}
    th:nth-child(2),td:nth-child(2),th:nth-child(3),td:nth-child(3){text-align:center}
    th:nth-child(3),td:nth-child(3){text-align:right}
    td{padding:11px 14px;font-size:14px;border-bottom:1px solid #f0f0f0}
    .item-name{font-weight:600}
    tbody tr:nth-child(even){background:#fafafa}
    .totals{display:flex;justify-content:flex-end;margin-bottom:28px}
    .totals-inner{width:260px}
    .trow{display:flex;justify-content:space-between;font-size:14px;padding:5px 0;border-bottom:1px solid #f0f0f0}
    .trow:last-child{border-bottom:none;border-top:2px solid #f97316;padding-top:10px;margin-top:4px;font-size:18px;font-weight:900;color:#f97316}
    .tlabel{color:#888}
    .footer{text-align:center;border-top:1px solid #eee;padding-top:20px}
    .footer-title{font-weight:800;font-size:15px;margin-bottom:5px}
    .footer-info{font-size:12px;color:#888;line-height:1.8}
    @media print{body{padding:20px}}
  </style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <div>
      <div class="brand-name">🍕 PIZZA PIXEL</div>
      <div class="brand-sub">Premium Italian Pizzeria</div>
    </div>
    <div>
      <div class="inv-title">INVOICE</div>
      <div class="inv-num">${order.invoiceNumber || "—"}</div>
    </div>
  </div>
  <div class="info">
    <div>
      <label>Billed To</label>
      <p>${order.customer || "—"}</p>
      ${order.customerPhone ? `<p class="sub">${order.customerPhone}</p>` : ""}
    </div>
    <div>
      <label>Date &amp; Time</label>
      <p>${safeFormat(order.time, "date")}</p>
      <p class="sub">${safeFormat(order.time, "time")}</p>
    </div>
    <div>
      <label>Order Type</label>
      <p><span class="badge ${isOnline ? "badge-online" : "badge-manual"}">${isOnline ? "🌐 Online" : "🏪 In-Store"}</span></p>
      <p class="sub">Status: ${order.status}</p>
    </div>
  </div>
  <table>
    <thead><tr>
      <th>Description</th><th>Qty</th><th>Unit Price</th><th>Amount</th>
    </tr></thead>
    <tbody>${rowsHTML || '<tr><td colspan="4" style="text-align:center;color:#888;padding:20px">No items</td></tr>'}</tbody>
  </table>
  <div class="totals">
    <div class="totals-inner">
      <div class="trow"><span class="tlabel">Subtotal</span><span>$${subtotal.toFixed(2)}</span></div>
      <div class="trow"><span class="tlabel">Tax (8%)</span><span>$${tax.toFixed(2)}</span></div>
      <div class="trow"><span>TOTAL</span><span>$${total.toFixed(2)}</span></div>
    </div>
  </div>
  <div class="footer">
    <div class="footer-title">Thank you for dining with Pizza Pixel! 🍕</div>
    <div class="footer-info">123 Pizza Street, Foodie City • contact@pizzapixel.com • (555) 123-4567</div>
  </div>
</div>
</body>
</html>`;
}

// ── Component ────────────────────────────────────────────────────────────────
const InvoiceModal = ({ order, open, onOpenChange }: InvoiceModalProps) => {
  if (!order) return null;

  const items = Array.isArray(order.orderItems) ? order.orderItems : [];
  const subtotal = items.reduce((a, i) => a + (Number(i.qty) || 0) * (Number(i.unitPrice) || 0), 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;
  const isOnline = !!(order as any).isOnline;

  const openPrintWindow = (autoPrint: boolean) => {
    const w = window.open("", "_blank", "width=800,height=900,scrollbars=yes");
    if (!w) {
      alert("Please allow popups for this site to print/save invoices.");
      return;
    }
    w.document.open();
    w.document.write(buildInvoiceHTML(order));
    w.document.close();
    if (autoPrint) {
      w.onload = () => { w.focus(); w.print(); };
      // Fallback if onload already fired
      setTimeout(() => { try { w.focus(); w.print(); } catch (_) { } }, 600);
    }
  };

  const statusBadge = () => {
    switch (order.status) {
      case "completed": return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200 gap-1"><CheckCircle2 className="h-3 w-3" />PAID</Badge>;
      case "cancelled": return <Badge className="bg-rose-500/10 text-rose-600 border-rose-200 gap-1"><XCircle className="h-3 w-3" />CANCELLED</Badge>;
      default: return <Badge className="bg-amber-500/10 text-amber-600 border-amber-200 gap-1"><Clock className="h-3 w-3" />PENDING</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 pt-5 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-bold">Invoice Preview</DialogTitle>
            <div className="flex items-center gap-2">
              {statusBadge()}
              <Badge className={`border-0 text-xs ${isOnline ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
                {isOnline ? "🌐 Online Order" : "🏪 In-Store"}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        {/* ── Preview body ── */}
        <div className="px-6 py-4">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-border pb-5 mb-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary p-2.5">
                <Pizza className="h-7 w-7 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight text-foreground">PIZZA PIXEL</h2>
                <p className="text-xs text-muted-foreground">Premium Italian Pizzeria</p>
              </div>
            </div>
            <div className="text-right">
              <h1 className="text-3xl font-black text-primary tracking-widest">INVOICE</h1>
              <p className="font-mono text-xs text-muted-foreground mt-1">{order.invoiceNumber || "—"}</p>
            </div>
          </div>

          {/* Info */}
          <div className="grid grid-cols-3 gap-4 rounded-xl bg-muted/40 border border-border p-4 mb-5 text-sm">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Billed To</p>
              <p className="font-bold text-foreground">{order.customer}</p>
              {order.customerPhone && <p className="text-muted-foreground text-xs">{order.customerPhone}</p>}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Date & Time</p>
              <p className="font-bold text-foreground">{safeFormat(order.time, "date")}</p>
              <p className="text-muted-foreground text-xs">{safeFormat(order.time, "time")}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Order Type</p>
              <p className="font-semibold text-foreground">{isOnline ? "🌐 Online Order" : "🏪 In-Store / Manual"}</p>
              <p className="text-muted-foreground text-xs capitalize">Status: {order.status}</p>
            </div>
          </div>

          {/* Items */}
          <div className="rounded-xl border border-border overflow-hidden mb-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-primary text-primary-foreground">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Item</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide">Qty</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide">Unit Price</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide">Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-6 text-center text-muted-foreground text-xs">No items</td></tr>
                ) : items.map((item, idx) => (
                  <tr key={idx} className={`border-b border-border/50 last:border-0 ${idx % 2 !== 0 ? "bg-muted/20" : ""}`}>
                    <td className="px-4 py-3 font-semibold text-foreground">{item.name}</td>
                    <td className="px-4 py-3 text-center text-muted-foreground">{item.qty}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">${Number(item.unitPrice).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-bold text-foreground">${(Number(item.qty) * Number(item.unitPrice)).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-5">
            <div className="w-56 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-medium">${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Tax (8%)</span><span className="font-medium">${tax.toFixed(2)}</span></div>
              <div className="flex justify-between border-t-2 border-primary pt-2 text-base font-black text-primary">
                <span>TOTAL</span><span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center border-t border-border pt-4">
            <p className="font-bold text-foreground text-sm">🍕 Thank you for dining with Pizza Pixel!</p>
            <p className="text-xs text-muted-foreground mt-1">123 Pizza Street, Foodie City • contact@pizzapixel.com • (555) 123-4567</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-border bg-muted/20">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4 mr-2" /> Close
          </Button>
          <Button variant="outline" onClick={() => openPrintWindow(false)} className="gap-2 border-primary/40 text-primary hover:bg-primary/5">
            <Download className="h-4 w-4" /> Save as PDF
          </Button>
          <Button onClick={() => openPrintWindow(true)} className="gap-2">
            <Printer className="h-4 w-4" /> Print Invoice
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceModal;
