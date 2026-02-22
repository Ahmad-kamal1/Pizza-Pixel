import { useState, useEffect, useRef } from "react";
import { apiGetUserMessages, apiSubmitContact } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Send, RefreshCw, MessageSquare, CheckCheck, Clock, User } from "lucide-react";

interface UserMessage {
    id: number;
    name: string;
    email: string;
    message: string;
    reply: string | null;
    read: number | boolean;
    time: string;
}

interface UserChatProps {
    userEmail: string;
    userName: string;
}

const UserChat = ({ userEmail, userName }: UserChatProps) => {
    const { toast } = useToast();
    const [messages, setMessages] = useState<UserMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [sending, setSending] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    const loadMessages = async (showRefresh = false) => {
        if (showRefresh) setRefreshing(true);
        try {
            const data = await apiGetUserMessages(userEmail);
            setMessages(data);
        } catch {
            // silently fail on refresh
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { loadMessages(); }, [userEmail]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        const text = newMessage.trim();
        if (!text) return;
        setSending(true);
        try {
            await apiSubmitContact({ name: userName, email: userEmail, message: text });
            toast({ title: "Message sent to admin!" });
            setNewMessage("");
            // Reload to show the new message
            await loadMessages();
        } catch (err: any) {
            toast({ title: "Failed to send", description: err.message, variant: "destructive" });
        } finally {
            setSending(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-48">
                <div className="flex flex-col items-center gap-2">
                    <span className="text-3xl animate-spin">🍕</span>
                    <p className="text-sm text-muted-foreground">Loading messages...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[520px] rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-muted/30">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <MessageSquare className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                        <p className="font-bold text-sm text-foreground">Chat with Admin</p>
                        <p className="text-xs text-muted-foreground">Pizza Pixel Support</p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => loadMessages(true)}
                    disabled={refreshing}
                    className="gap-1.5 text-xs rounded-lg h-8"
                >
                    <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
                    Refresh
                </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-8">
                        <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                            <MessageSquare className="h-7 w-7 text-primary/60" />
                        </div>
                        <p className="font-semibold text-foreground">No messages yet</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            Send a message below to contact our team!
                        </p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div key={msg.id} className="space-y-3">
                            {/* User's message — right aligned */}
                            <div className="flex justify-end gap-2">
                                <div className="max-w-[75%]">
                                    <div className="rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-primary-foreground">
                                        <p className="text-sm leading-relaxed">{msg.message}</p>
                                    </div>
                                    <div className="flex items-center justify-end gap-1 mt-1">
                                        <span className="text-[10px] text-muted-foreground">
                                            {new Date(msg.time).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                            {" · "}
                                            {new Date(msg.time).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                                        </span>
                                        {msg.reply ? (
                                            <CheckCheck className="h-3 w-3 text-primary" />
                                        ) : (
                                            <Clock className="h-3 w-3 text-muted-foreground" />
                                        )}
                                    </div>
                                </div>
                                <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground flex-shrink-0 mt-1">
                                    {userName.charAt(0).toUpperCase()}
                                </div>
                            </div>

                            {/* Admin reply — left aligned */}
                            {msg.reply && (
                                <div className="flex gap-2">
                                    <div className="h-7 w-7 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center flex-shrink-0 mt-1">
                                        <span className="text-sm">🍕</span>
                                    </div>
                                    <div className="max-w-[75%]">
                                        <div className="rounded-2xl rounded-tl-sm bg-muted/70 border border-border px-4 py-2.5">
                                            <p className="text-[10px] font-semibold text-primary mb-0.5">Pizza Pixel Admin</p>
                                            <p className="text-sm text-foreground leading-relaxed">{msg.reply}</p>
                                        </div>
                                        <div className="flex items-center gap-1 mt-1">
                                            <Badge className="bg-emerald-50 text-emerald-700 border-0 text-[10px] px-2 py-0 h-4">
                                                Replied
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input area */}
            <div className="border-t border-border p-3 bg-muted/20">
                <div className="flex gap-2 items-end">
                    <div className="flex-1">
                        <Textarea
                            placeholder="Type a message to admin... (Enter to send)"
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                            rows={2}
                            className="resize-none rounded-xl text-sm"
                        />
                    </div>
                    <Button
                        onClick={handleSend}
                        disabled={sending || !newMessage.trim()}
                        className="h-10 w-10 rounded-xl p-0 flex-shrink-0"
                    >
                        {sending
                            ? <RefreshCw className="h-4 w-4 animate-spin" />
                            : <Send className="h-4 w-4" />
                        }
                    </Button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1.5 px-1">
                    Press Enter to send • Shift+Enter for new line
                </p>
            </div>
        </div>
    );
};

export default UserChat;
