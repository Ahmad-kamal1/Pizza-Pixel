import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { User, Camera, Link2, Upload, Save, Key, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface CurrentUser {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address?: string;
    avatar?: string;
}

interface StoredUser {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
    avatar?: string;
}

const ProfilePage = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [user, setUser] = useState<CurrentUser | null>(null);
    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        phone: "",
        address: "",
        avatarUrl: "",
    });
    const [avatarPreview, setAvatarPreview] = useState("");
    const [imageTab, setImageTab] = useState<"url" | "upload">("url");

    // Password change
    const [pwForm, setPwForm] = useState({ current: "", newPw: "", confirm: "" });
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        const data = localStorage.getItem("pizzaPixelCurrentUser");
        if (!data) {
            navigate("/auth");
            return;
        }
        const u: CurrentUser = JSON.parse(data);
        setUser(u);
        setForm({
            firstName: u.firstName,
            lastName: u.lastName,
            phone: u.phone ?? "",
            address: u.address ?? "",
            avatarUrl: u.avatar ?? "",
        });
        setAvatarPreview(u.avatar ?? "");
    }, [navigate]);

    const handleAvatarUrlChange = (url: string) => {
        setForm((f) => ({ ...f, avatarUrl: url }));
        setAvatarPreview(url);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            setAvatarPreview(result);
            setForm((f) => ({ ...f, avatarUrl: result }));
        };
        reader.readAsDataURL(file);
    };

    const handleSaveProfile = () => {
        if (!form.firstName.trim() || !form.lastName.trim()) {
            toast({ title: "Name is required", variant: "destructive" });
            return;
        }

        const updated: CurrentUser = {
            ...user!,
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            phone: form.phone.trim(),
            address: form.address.trim(),
            avatar: avatarPreview || user?.avatar,
        };

        // Update current user session
        localStorage.setItem("pizzaPixelCurrentUser", JSON.stringify(updated));
        setUser(updated);

        // Update in users list too
        const usersJSON = localStorage.getItem("pizzaPixelUsers");
        if (usersJSON) {
            const users: StoredUser[] = JSON.parse(usersJSON);
            const idx = users.findIndex(
                (u) => u.email.toLowerCase() === user!.email.toLowerCase()
            );
            if (idx !== -1) {
                users[idx] = {
                    ...users[idx],
                    firstName: updated.firstName,
                    lastName: updated.lastName,
                    phone: updated.phone,
                    address: updated.address,
                    avatar: updated.avatar,
                };
                localStorage.setItem("pizzaPixelUsers", JSON.stringify(users));
            }
        }

        window.dispatchEvent(new Event("pizzaPixelAuthChange"));
        toast({ title: "Profile updated successfully!" });
    };

    const handleChangePassword = () => {
        if (!pwForm.current || !pwForm.newPw || !pwForm.confirm) {
            toast({ title: "Please fill in all password fields", variant: "destructive" });
            return;
        }
        if (pwForm.newPw.length < 6) {
            toast({ title: "New password must be at least 6 characters", variant: "destructive" });
            return;
        }
        if (pwForm.newPw !== pwForm.confirm) {
            toast({ title: "Passwords don't match", variant: "destructive" });
            return;
        }

        const usersJSON = localStorage.getItem("pizzaPixelUsers");
        if (!usersJSON) {
            toast({ title: "Could not update password", variant: "destructive" });
            return;
        }
        const users: StoredUser[] = JSON.parse(usersJSON);
        const idx = users.findIndex(
            (u) => u.email.toLowerCase() === user!.email.toLowerCase()
        );
        if (idx === -1 || users[idx].password !== pwForm.current) {
            toast({ title: "Current password is incorrect", variant: "destructive" });
            return;
        }

        users[idx].password = pwForm.newPw;
        localStorage.setItem("pizzaPixelUsers", JSON.stringify(users));
        setPwForm({ current: "", newPw: "", confirm: "" });
        toast({ title: "Password changed successfully!" });
    };

    const getInitials = () => {
        if (!user) return "?";
        return `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase();
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-background px-4 py-10">
            <div className="mx-auto max-w-2xl space-y-6">
                {/* Back */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" /> Back
                </button>

                {/* Header card */}
                <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
                    <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
                        {/* Avatar */}
                        <div className="relative shrink-0">
                            {avatarPreview ? (
                                <img
                                    src={avatarPreview}
                                    alt="Avatar"
                                    className="h-24 w-24 rounded-full object-cover border-4 border-primary/20 shadow"
                                    onError={() => setAvatarPreview("")}
                                />
                            ) : (
                                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 border-4 border-primary/20 shadow text-3xl font-bold text-primary">
                                    {getInitials()}
                                </div>
                            )}
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow hover:bg-primary/90 transition-colors"
                                title="Upload photo"
                            >
                                <Camera className="h-4 w-4" />
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileUpload}
                            />
                        </div>

                        <div>
                            <h1 className="text-2xl font-extrabold text-foreground">
                                {user.firstName} {user.lastName}
                            </h1>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            <span className="mt-1 inline-block rounded-full bg-primary/10 px-3 py-0.5 text-xs font-semibold text-primary">
                                Customer
                            </span>
                        </div>
                    </div>
                </div>

                {/* Edit Profile */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
                    <div className="flex items-center gap-2 border-b border-border pb-3">
                        <User className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-bold text-foreground">Edit Profile</h2>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="prof-first">First Name</Label>
                            <Input
                                id="prof-first"
                                placeholder="John"
                                value={form.firstName}
                                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="prof-last">Last Name</Label>
                            <Input
                                id="prof-last"
                                placeholder="Doe"
                                value={form.lastName}
                                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label>Email (cannot be changed)</Label>
                        <Input value={user.email} disabled className="opacity-60 cursor-not-allowed" />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="prof-phone">Phone Number</Label>
                        <Input
                            id="prof-phone"
                            placeholder="+92 300 0000000"
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="prof-address">Address</Label>
                        <Input
                            id="prof-address"
                            placeholder="123 Main Street, City"
                            value={form.address}
                            onChange={(e) => setForm({ ...form, address: e.target.value })}
                        />
                    </div>

                    {/* Avatar upload */}
                    <div className="space-y-2">
                        <Label>Profile Photo</Label>
                        <div className="flex gap-2 mb-2">
                            <button
                                type="button"
                                onClick={() => setImageTab("url")}
                                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${imageTab === "url"
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                <Link2 className="h-3.5 w-3.5" /> Via URL
                            </button>
                            <button
                                type="button"
                                onClick={() => setImageTab("upload")}
                                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${imageTab === "upload"
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                <Upload className="h-3.5 w-3.5" /> Upload File
                            </button>
                        </div>

                        {imageTab === "url" ? (
                            <Input
                                placeholder="https://example.com/avatar.jpg"
                                value={form.avatarUrl.startsWith("data:") ? "" : form.avatarUrl}
                                onChange={(e) => handleAvatarUrlChange(e.target.value)}
                            />
                        ) : (
                            <div
                                className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 p-5 text-muted-foreground transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload className="h-6 w-6" />
                                <p className="text-xs font-medium">Click to upload image from your device</p>
                                <p className="text-xs opacity-60">PNG, JPG, GIF, WEBP</p>
                            </div>
                        )}

                        {avatarPreview && (
                            <div className="flex items-center gap-3 mt-2">
                                <img
                                    src={avatarPreview}
                                    alt="Preview"
                                    className="h-12 w-12 rounded-full object-cover border border-border"
                                    onError={() => setAvatarPreview("")}
                                />
                                <span className="text-xs text-muted-foreground">Preview</span>
                                <button
                                    type="button"
                                    onClick={() => { setAvatarPreview(""); setForm({ ...form, avatarUrl: "" }); }}
                                    className="ml-auto text-xs text-destructive hover:underline"
                                >
                                    Remove
                                </button>
                            </div>
                        )}
                    </div>

                    <Button
                        onClick={handleSaveProfile}
                        className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                        <Save className="h-4 w-4" /> Save Profile
                    </Button>
                </div>

                {/* Change Password */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 border-b border-border pb-3">
                        <Key className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-bold text-foreground">Change Password</h2>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="pw-current">Current Password</Label>
                        <div className="relative">
                            <Input
                                id="pw-current"
                                type={showCurrent ? "text" : "password"}
                                placeholder="••••••••"
                                value={pwForm.current}
                                onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })}
                                className="pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrent(!showCurrent)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="pw-new">New Password</Label>
                        <div className="relative">
                            <Input
                                id="pw-new"
                                type={showNew ? "text" : "password"}
                                placeholder="••••••••"
                                value={pwForm.newPw}
                                onChange={(e) => setPwForm({ ...pwForm, newPw: e.target.value })}
                                className="pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNew(!showNew)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="pw-confirm">Confirm New Password</Label>
                        <div className="relative">
                            <Input
                                id="pw-confirm"
                                type={showConfirm ? "text" : "password"}
                                placeholder="••••••••"
                                value={pwForm.confirm}
                                onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                                className="pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    <Button
                        onClick={handleChangePassword}
                        variant="outline"
                        className="gap-2"
                    >
                        <Key className="h-4 w-4" /> Update Password
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
