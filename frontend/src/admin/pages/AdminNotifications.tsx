import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
    apiGetContactMessages,
    apiReplyToMessage,
    apiMarkMessageRead
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Mail, Check, MessageSquareReply, Send, Inbox } from "lucide-react";

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
    const [replyModalOpen, setReplyModalOpen] = useState(false);
    const [selectedMsg, setSelectedMsg] = useState<ContactMessage | null>(null);
    const [replyText, setReplyText] = useState("");
    const [sending, setSending] = useState(false);

    const loadMessages = async () => {
        try {
            const data = await apiGetContactMessages();
            setMessages(data);
        } catch (err: any) {
            toast({ title: "Failed to load messages", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMessages();
    }, []);

    const handleOpenReply = async (msg: ContactMessage) => {
        setSelectedMsg(msg);
        setReplyText(msg.reply || "");
        setReplyModalOpen(true);

        if (!msg.read) {
            try {
                await apiMarkMessageRead(msg.id);
                setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, read: 1 } : m));
            } catch (err) { }
        }
    };

    const handleSendReply = async () => {
        if (!selectedMsg || !replyText.trim()) return;
        setSending(true);
        try {
            await apiReplyToMessage(selectedMsg.id, replyText);
            toast({ title: "Reply sent successfully!" });
            setMessages(prev => prev.map(m =>
                m.id === selectedMsg.id ? { ...m, reply: replyText, read: 1 } : m
            ));
            setReplyModalOpen(false);
        } catch (err: any) {
            toast({ title: "Failed to send reply", description: err.message, variant: "destructive" });
        } finally {
            setSending(false);
        }
    };

    const markAsRead = async (id: number) => {
        try {
            await apiMarkMessageRead(id);
            setMessages(prev => prev.map(m => m.id === id ? { ...m, read: 1 } : m));
        } catch (err) { }
    };

    if (loading) {
        return <div className="p-10 text-center"><span className="animate-spin text-2xl">🍕</span></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold text-foreground">Messages & Notifications</h1>
                    <p className="text-sm text-muted-foreground">View and reply to customer inquiries.</p>
                </div>
            </div>

            <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border bg-muted/40">
                                <th className="px-6 py-4 text-left font-semibold text-muted-foreground w-1/4">Sender</th>
                                <th className="px-6 py-4 text-left font-semibold text-muted-foreground w-1/3">Message</th>
                                <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Date</th>
                                <th className="px-6 py-4 text-center font-semibold text-muted-foreground">Status</th>
                                <th className="px-6 py-4 text-right font-semibold text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {messages.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center">
                                        <Inbox className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
                                        <p className="text-muted-foreground">No messages found.</p>
                                    </td>
                                </tr>
                            ) : (
                                messages.map((msg) => (
                                    <tr key={msg.id} className={`border-b border-border/50 transition-colors hover:bg-muted/30 last:border-0 ${!msg.read ? 'bg-primary/5' : ''}`}>
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-foreground">{msg.name}</div>
                                            <div className="text-xs text-muted-foreground">{msg.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="line-clamp-2 text-muted-foreground" title={msg.message}>
                                                {msg.message}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-muted-foreground text-xs">
                                            {format(new Date(msg.time), "MMM dd, yyyy HH:mm")}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {msg.reply ? (
                                                <Badge className="bg-emerald-500/10 text-emerald-600 border-0">Replied</Badge>
                                            ) : msg.read ? (
                                                <Badge variant="outline" className="text-muted-foreground">Read</Badge>
                                            ) : (
                                                <Badge className="bg-primary/20 text-primary border-0">New</Badge>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {!msg.read && (
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => markAsRead(msg.id)} title="Mark as read">
                                                        <Check className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                <Button variant="secondary" size="sm" className="h-8 gap-1.5" onClick={() => handleOpenReply(msg)}>
                                                    <MessageSquareReply className="h-3.5 w-3.5" />
                                                    {msg.reply ? "View Reply" : "Reply"}
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Dialog open={replyModalOpen} onOpenChange={setReplyModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Reply to {selectedMsg?.name}</DialogTitle>
                        <DialogDescription>
                            {selectedMsg?.email}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-3">
                        <div className="rounded-xl bg-muted/50 p-4 text-sm text-foreground border border-border">
                            <p className="font-medium mb-1 text-xs text-muted-foreground">Original Message:</p>
                            <p className="whitespace-pre-wrap">{selectedMsg?.message}</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Your Reply</label>
                            <Textarea
                                placeholder="Type your reply here..."
                                rows={5}
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                disabled={!!selectedMsg?.reply}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setReplyModalOpen(false)}>
                            {selectedMsg?.reply ? "Close" : "Cancel"}
                        </Button>
                        {!selectedMsg?.reply && (
                            <Button onClick={handleSendReply} disabled={sending || !replyText.trim()} className="gap-2 bg-primary">
                                <Send className="h-4 w-4" />
                                {sending ? "Sending..." : "Send Reply"}
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminNotifications;
