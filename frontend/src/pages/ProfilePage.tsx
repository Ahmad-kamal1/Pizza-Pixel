import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    User, Camera, Link2, Upload, Save, Key, Eye, EyeOff, ArrowLeft, MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiGetProfile, apiUpdateProfile, apiChangePassword } from "@/lib/api";
import UserChat from "@/components/UserChat";

interface CurrentUser {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address?: string;
    avatar?: string;
    role?: string;
}

type Tab = "profile" | "password" | "chat";

const ProfilePage = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [activeTab, setActiveTab] = useState<Tab>("profile");
    const [saveLoading, setSaveLoading] = useState(false);
    const [pwLoading, setPwLoading] = useState(false);

    const [user, setUser] = useState<CurrentUser | null>(null);
    const [form, setForm] = useState({ firstName: "", lastName: "", phone: "", address: "" });
    const [avatarPreview, setAvatarPreview] = useState("");
    const [imageTab, setImageTab] = useState<"url" | "upload">("url");
    const [avatarUrl, setAvatarUrl] = useState("");

    const [pwForm, setPwForm] = useState({ current: "", newPw: "", confirm: "" });
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        const sessionData = localStorage.getItem("pizzaPixelCurrentUser");
        if (!sessionData) { navigate("/auth"); return; }
        const session: CurrentUser = JSON.parse(sessionData);
        setUser(session);

        apiGetProfile(session.email)
            .then((profile) => {
                setUser(profile);
                setForm({
                    firstName: profile.firstName,
                    lastName: profile.lastName,
                    phone: profile.phone || "",
                    address: profile.address || "",
                });
                setAvatarPreview(profile.avatar || "");
                setAvatarUrl(profile.avatar?.startsWith("data:") ? "" : profile.avatar || "");
            })
            .catch(() => {
                setForm({
                    firstName: session.firstName,
                    lastName: session.lastName,
                    phone: session.phone || "",
                    address: session.address || "",
                });
                setAvatarPreview(session.avatar || "");
                setAvatarUrl(session.avatar?.startsWith("data:") ? "" : session.avatar || "");
            });
    }, [navigate]);

    const handleAvatarUrlChange = (url: string) => { setAvatarUrl(url); setAvatarPreview(url); };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => { setAvatarPreview(reader.result as string); setAvatarUrl(""); };
        reader.readAsDataURL(file);
    };

    const handleSaveProfile = async () => {
        if (!form.firstName.trim() || !form.lastName.trim()) {
            toast({ title: "Name is required", variant: "destructive" });
            return;
        }
        setSaveLoading(true);
        try {
            await apiUpdateProfile(user!.email, {
                firstName: form.firstName.trim(),
                lastName: form.lastName.trim(),
                phone: form.phone.trim(),
                address: form.address.trim(),
                avatar: avatarPreview,
            });
            const updated = { ...user!, ...form, avatar: avatarPreview };
            setUser(updated);
            localStorage.setItem("pizzaPixelCurrentUser", JSON.stringify(updated));
            window.dispatchEvent(new Event("pizzaPixelAuthChange"));
            toast({ title: "Profile updated successfully!" });
        } catch (err: any) {
            toast({ title: err.message || "Failed to update profile", variant: "destructive" });
        } finally {
            setSaveLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (!pwForm.current || !pwForm.newPw || !pwForm.confirm) {
            toast({ title: "Please fill in all password fields", variant: "destructive" }); return;
        }
        if (pwForm.newPw.length < 6) {
            toast({ title: "Password must be at least 6 characters", variant: "destructive" }); return;
        }
        if (pwForm.newPw !== pwForm.confirm) {
            toast({ title: "Passwords don't match", variant: "destructive" }); return;
        }
        setPwLoading(true);
        try {
            await apiChangePassword(user!.email, pwForm.current, pwForm.newPw);
            setPwForm({ current: "", newPw: "", confirm: "" });
            toast({ title: "Password changed successfully!" });
        } catch (err: any) {
            toast({ title: err.message || "Failed to change password", variant: "destructive" });
        } finally {
            setPwLoading(false);
        }
    };

    const getInitials = () => {
        if (!user) return "?";
        return `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase();
    };

    if (!user) return null;

    const navItems: { id: Tab; label: string; icon: React.ElementType }[] = [
        { id: "profile", label: "Edit Profile", icon: User },
        { id: "password", label: "Change Password", icon: Key },
        { id: "chat", label: "Chat with Admin", icon: MessageSquare },
    ];

    return (
        <div className="min-h-screen bg-background px-4 py-10">
            <div className="mx-auto max-w-4xl">
                {/* Back */}
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" /> Back
                </button>

                {/* Profile Header */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm mb-6">
                    <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
                        <div className="relative shrink-0">
                            {avatarPreview ? (
                                <img
                                    src={avatarPreview}
                                    alt="Avatar"
                                    className="h-20 w-20 rounded-full object-cover border-4 border-primary/20 shadow"
                                    onError={() => setAvatarPreview("")}
                                />
                            ) : (
                                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 border-4 border-primary/20 shadow text-2xl font-bold text-primary">
                                    {getInitials()}
                                </div>
                            )}
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow hover:bg-primary/90 transition-colors"
                            >
                                <Camera className="h-3.5 w-3.5" />
                            </button>
                            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-extrabold text-foreground">{user.firstName} {user.lastName}</h1>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            <span className="mt-1 inline-block rounded-full bg-primary/10 px-3 py-0.5 text-xs font-semibold text-primary capitalize">
                                {user.role || "Customer"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Two Column Layout: Sidebar + Content */}
                <div className="grid grid-cols-1 gap-5 md:grid-cols-4">

                    {/* Sidebar Navigation */}
                    <div className="md:col-span-1">
                        <div className="rounded-2xl border border-border bg-card p-2 shadow-sm space-y-1 sticky top-6">
                            {navItems.map(({ id, label, icon: Icon }) => (
                                <button
                                    key={id}
                                    onClick={() => setActiveTab(id)}
                                    className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all text-left
                                        ${activeTab === id
                                            ? "bg-primary text-primary-foreground shadow-sm"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                        }`}
                                >
                                    <Icon className="h-4 w-4 flex-shrink-0" />
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="md:col-span-3">
                        {/* ─── Edit Profile Tab ─── */}
                        {activeTab === "profile" && (
                            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
                                <div className="flex items-center gap-2 border-b border-border pb-3">
                                    <User className="h-5 w-5 text-primary" />
                                    <h2 className="text-lg font-bold text-foreground">Edit Profile</h2>
                                </div>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label>First Name</Label>
                                        <Input placeholder="John" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>Last Name</Label>
                                        <Input placeholder="Doe" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Email (cannot be changed)</Label>
                                    <Input value={user.email} disabled className="opacity-60 cursor-not-allowed" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Phone Number</Label>
                                    <Input placeholder="+92 300 0000000" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Address</Label>
                                    <Input placeholder="123 Main Street, City" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
                                </div>

                                {/* Avatar upload */}
                                <div className="space-y-3 pt-1">
                                    <Label>Profile Photo</Label>
                                    <div className="flex gap-2">
                                        {(["url", "upload"] as const).map(t => (
                                            <button key={t} type="button" onClick={() => setImageTab(t)}
                                                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${imageTab === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
                                                {t === "url" ? <Link2 className="h-3.5 w-3.5" /> : <Upload className="h-3.5 w-3.5" />}
                                                {t === "url" ? "Via URL" : "Upload File"}
                                            </button>
                                        ))}
                                    </div>
                                    {imageTab === "url" ? (
                                        <Input placeholder="https://example.com/avatar.jpg" value={avatarUrl} onChange={e => handleAvatarUrlChange(e.target.value)} />
                                    ) : (
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 p-5 text-muted-foreground transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
                                        >
                                            <Upload className="h-6 w-6" />
                                            <p className="text-xs font-medium">Click to upload image</p>
                                            <p className="text-xs opacity-60">PNG, JPG, GIF, WEBP</p>
                                        </div>
                                    )}
                                    {avatarPreview && (
                                        <div className="flex items-center gap-3">
                                            <img src={avatarPreview} alt="Preview" className="h-10 w-10 rounded-full object-cover border border-border" onError={() => setAvatarPreview("")} />
                                            <span className="text-xs text-muted-foreground">Preview</span>
                                            <button type="button" onClick={() => { setAvatarPreview(""); setAvatarUrl(""); }} className="ml-auto text-xs text-destructive hover:underline">Remove</button>
                                        </div>
                                    )}
                                </div>

                                <Button onClick={handleSaveProfile} disabled={saveLoading} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                                    <Save className="h-4 w-4" /> {saveLoading ? "Saving…" : "Save Profile"}
                                </Button>
                            </div>
                        )}

                        {/* ─── Change Password Tab ─── */}
                        {activeTab === "password" && (
                            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
                                <div className="flex items-center gap-2 border-b border-border pb-3">
                                    <Key className="h-5 w-5 text-primary" />
                                    <h2 className="text-lg font-bold text-foreground">Change Password</h2>
                                </div>
                                {[
                                    { id: "current", label: "Current Password", val: pwForm.current, show: showCurrent, setShow: setShowCurrent, key: "current" as const },
                                    { id: "new", label: "New Password", val: pwForm.newPw, show: showNew, setShow: setShowNew, key: "newPw" as const },
                                    { id: "confirm", label: "Confirm New Password", val: pwForm.confirm, show: showConfirm, setShow: setShowConfirm, key: "confirm" as const },
                                ].map(field => (
                                    <div key={field.id} className="space-y-1.5">
                                        <Label htmlFor={`pw-${field.id}`}>{field.label}</Label>
                                        <div className="relative">
                                            <Input id={`pw-${field.id}`} type={field.show ? "text" : "password"} placeholder="••••••••" value={field.val}
                                                onChange={e => setPwForm({ ...pwForm, [field.key]: e.target.value })} className="pr-10" />
                                            <button type="button" onClick={() => field.setShow(!field.show)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                                                {field.show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <Button onClick={handleChangePassword} disabled={pwLoading} variant="outline" className="gap-2">
                                    <Key className="h-4 w-4" /> {pwLoading ? "Updating…" : "Update Password"}
                                </Button>
                            </div>
                        )}

                        {/* ─── Chat Tab ─── */}
                        {activeTab === "chat" && (
                            <UserChat
                                userEmail={user.email}
                                userName={`${user.firstName} ${user.lastName}`}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
