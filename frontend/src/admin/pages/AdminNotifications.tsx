import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { apiGetContactMessages, apiReplyToMessage, apiMarkMessageRead } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Mail, Check, Send, Inbox, RefreshCw, User, Clock } from "lucide-react";

interface ContactMessage {
    id: number;
    name: string;
    email: string;
    message: string;
    read: number | boolean;
    reply: string | null;
    time: string;
}

const AdminNotifications = () => {
    const { toast } = useToast();
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedMsg, setSelectedMsg] = useState<ContactMessage | null>(null);
    const [replyText, setReplyText] = useState("");
    const [sending, setSending] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const loadMessages = async (showRefresh = false) => {
        if (showRefresh) setRefreshing(true);
        try {
            const data = await apiGetContactMessages();
            setMessages(data);
        } catch {
            toast({ title: "Failed to load messages", variant: "destructive" });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { loadMessages(); }, []);

    const handleSelectMsg = async (msg: ContactMessage) => {
        setSelectedMsg(msg);
        setReplyText(msg.reply || "");
        if (!msg.read) {
            try {
                await apiMarkMessageRead(msg.id);
                setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, read: 1 } : m));
            } catch { }
        }
        setTimeout(() => textareaRef.current?.focus(), 100);
    };

    const handleSendReply = async () => {
        if (!selectedMsg || !replyText.trim()) return;
        setSending(true);
        try {
            await apiReplyToMessage(selectedMsg.id, replyText.trim());
            const updated = { ...selectedMsg, reply: replyText.trim(), read: 1 };
            setMessages(prev => prev.map(m => m.id === selectedMsg.id ? updated : m));
            setSelectedMsg(updated);
            toast({ title: "✅ Reply sent successfully!" });
        } catch (err: any) {
            toast({ title: "Failed to send reply", description: err.message, variant: "destructive" });
        } finally {
            setSending(false);
        }
    };

    const unreadCount = messages.filter(m => !m.read).length;
    const repliedCount = messages.filter(m => m.reply).length;

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <span className="text-4xl animate-spin">🍕</span>
                    <p className="text-sm text-muted-foreground">Loading messages...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold text-foreground">Messages & Notifications</h1>
                    <p className="text-sm text-muted-foreground">View and reply to all customer inquiries.</p>
                </div>
                <Button variant="outline" onClick={() => loadMessages(true)} className="gap-2 rounded-xl" disabled={refreshing}>
                    <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                    Refresh
                </Button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: "Total Messages", value: messages.length, color: "text-primary", bg: "bg-primary/10" },
                    { label: "Unread", value: unreadCount, color: "text-amber-600", bg: "bg-amber-50" },
                    { label: "Replied", value: repliedCount, color: "text-emerald-600", bg: "bg-emerald-50" },
                ].map(card => (
                    <div key={card.label} className="rounded-2xl border border-border bg-card p-4 shadow-sm text-center">
                        <p className={`text-3xl font-black ${card.color}`}>{card.value}</p>
                        <p className="text-xs text-muted-foreground font-medium mt-1">{card.label}</p>
                    </div>
                ))}
            </div>

            {/* Two-Panel Layout */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-5" style={{ minHeight: "520px" }}>
                {/* Left: Message List */}
                <div className="lg:col-span-2 rounded-2xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
                    <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
                        <h2 className="font-bold text-sm text-foreground flex items-center gap-2">
                            <Inbox className="h-4 w-4 text-primary" /> Inbox
                        </h2>
                        {unreadCount > 0 && (
                            <Badge className="bg-primary text-primary-foreground text-xs">{unreadCount} new</Badge>
                        )}
                    </div>
                    <div className="flex-1 overflow-y-auto divide-y divide-border/60">
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-14 text-center px-4">
                                <Inbox className="h-10 w-10 text-muted-foreground/30 mb-2" />
                                <p className="text-sm text-muted-foreground">No messages yet.</p>
                            </div>
                        ) : messages.map(msg => (
                            <button
                                key={msg.id}
                                onClick={() => handleSelectMsg(msg)}
                                className={`w-full text-left px-4 py-3.5 transition-colors hover:bg-muted/40 ${selectedMsg?.id === msg.id ? "bg-primary/5 border-l-2 border-primary" : "border-l-2 border-transparent"} ${!msg.read ? "bg-primary/5" : ""}`}
                            >
                                <div className="flex items-start justify-between gap-2 mb-1">
                                    <span className="font-semibold text-sm text-foreground truncate flex items-center gap-1.5">
                                        {!msg.read && <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0 inline-block" />}
                                        {msg.name}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground whitespace-nowrap flex-shrink-0">
                                        {format(new Date(msg.time), "MMM dd")}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground truncate">{msg.email}</p>
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{msg.message}</p>
                                <div className="mt-2">
                                    {msg.reply
                                        ? <Badge className="bg-emerald-50 text-emerald-700 border-0 text-[10px] px-2">Replied</Badge>
                                        : msg.read
                                            ? <Badge variant="outline" className="text-[10px] px-2">Read</Badge>
                                            : <Badge className="bg-primary/20 text-primary border-0 text-[10px] px-2">New</Badge>
                                    }
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right: Conversation View */}
                <div className="lg:col-span-3 rounded-2xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
                    {!selectedMsg ? (
                        <div className="flex flex-col items-center justify-center h-full py-14 text-center px-6 text-muted-foreground">
                            <Mail className="h-12 w-12 text-muted-foreground/20 mb-3" />
                            <p className="font-semibold text-foreground">No message selected</p>
                            <p className="text-sm mt-1">Select a message from the inbox to view and reply.</p>
                        </div>
                    ) : (
                        <>
                            {/* Conversation Header */}
                            <div className="px-5 py-4 border-b border-border bg-muted/30">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                                            <User className="h-4 w-4 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-foreground">{selectedMsg.name}</p>
                                            <p className="text-xs text-muted-foreground">{selectedMsg.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Clock className="h-3.5 w-3.5" />
                                        {format(new Date(selectedMsg.time), "MMM dd, yyyy • hh:mm a")}
                                    </div>
                                </div>
                            </div>

                            {/* Message + Reply Conversation Thread */}
                            <div className="flex-1 overflow-y-auto p-5 space-y-4">
                                {/* Customer's Message */}
                                <div className="flex gap-3">
                                    <div className="h-8 w-8 rounded-full bg-muted border border-border flex items-center justify-center flex-shrink-0">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div className="rounded-2xl rounded-tl-sm bg-muted/60 border border-border px-4 py-3 max-w-[85%]">
                                        <p className="text-xs font-semibold text-muted-foreground mb-1">{selectedMsg.name}</p>
                                        <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{selectedMsg.message}</p>
                                    </div>
                                </div>

                                {/* Admin's Reply (if exists) */}
                                {selectedMsg.reply && (
                                    <div className="flex gap-3 flex-row-reverse">
                                        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary-foreground">A</div>
                                        <div className="rounded-2xl rounded-tr-sm bg-primary/10 border border-primary/20 px-4 py-3 max-w-[85%]">
                                            <p className="text-xs font-semibold text-primary mb-1">You (Admin)</p>
                                            <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{selectedMsg.reply}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Reply Box */}
                            <div className="border-t border-border p-4 bg-muted/20">
                                {selectedMsg.reply ? (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground py-1">
                                        <Check className="h-4 w-4 text-emerald-500" />
                                        You have already replied to this message.
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        <Textarea
                                            ref={textareaRef}
                                            placeholder="Type your reply to the customer..."
                                            rows={3}
                                            value={replyText}
                                            onChange={e => setReplyText(e.target.value)}
                                            className="rounded-xl resize-none text-sm"
                                        />
                                        <div className="flex justify-end">
                                            <Button
                                                onClick={handleSendReply}
                                                disabled={sending || !replyText.trim()}
                                                className="gap-2 rounded-xl"
                                            >
                                                {sending ? (
                                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Send className="h-4 w-4" />
                                                )}
                                                {sending ? "Sending..." : "Send Reply"}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminNotifications;
