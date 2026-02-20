import { useState, useEffect, useRef } from "react";
import { Camera, Link2, Upload, Save, Key, Eye, EyeOff, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface AdminProfile {
    name: string;
    email: string;
    role: string;
    phone: string;
    avatar: string;
    password: string;
}

const DEFAULT_PROFILE: AdminProfile = {
    name: "Admin",
    email: "admin@pizzapixel.com",
    role: "Super Admin",
    phone: "",
    avatar: "",
    password: "admin123",
};

const AdminProfilePage = () => {
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [profile, setProfile] = useState<AdminProfile>(DEFAULT_PROFILE);
    const [form, setForm] = useState({ name: "", email: "", role: "", phone: "", avatarUrl: "" });
    const [avatarPreview, setAvatarPreview] = useState("");
    const [imageTab, setImageTab] = useState<"url" | "upload">("url");

    // Password section
    const [pwForm, setPwForm] = useState({ current: "", newPw: "", confirm: "" });
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem("pizzaPixelAdminProfile");
        const p: AdminProfile = stored ? JSON.parse(stored) : DEFAULT_PROFILE;
        setProfile(p);
        setForm({
            name: p.name,
            email: p.email,
            role: p.role,
            phone: p.phone,
            avatarUrl: p.avatar.startsWith("data:") ? "" : p.avatar,
        });
        setAvatarPreview(p.avatar);
    }, []);

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
            setForm((f) => ({ ...f, avatarUrl: "" }));
        };
        reader.readAsDataURL(file);
    };

    const handleSave = () => {
        if (!form.name.trim()) {
            toast({ title: "Name is required", variant: "destructive" });
            return;
        }
        const updated: AdminProfile = {
            ...profile,
            name: form.name.trim(),
            email: form.email.trim(),
            role: form.role.trim(),
            phone: form.phone.trim(),
            avatar: avatarPreview,
        };
        localStorage.setItem("pizzaPixelAdminProfile", JSON.stringify(updated));
        setProfile(updated);
        toast({ title: "Admin profile updated!" });
    };

    const handleChangePassword = () => {
        if (!pwForm.current || !pwForm.newPw || !pwForm.confirm) {
            toast({ title: "Please fill in all password fields", variant: "destructive" });
            return;
        }
        if (pwForm.current !== profile.password) {
            toast({ title: "Current password is incorrect", variant: "destructive" });
            return;
        }
        if (pwForm.newPw.length < 6) {
            toast({ title: "Password must be at least 6 characters", variant: "destructive" });
            return;
        }
        if (pwForm.newPw !== pwForm.confirm) {
            toast({ title: "New passwords don't match", variant: "destructive" });
            return;
        }
        const updated = { ...profile, password: pwForm.newPw };
        localStorage.setItem("pizzaPixelAdminProfile", JSON.stringify(updated));
        setProfile(updated);
        setPwForm({ current: "", newPw: "", confirm: "" });
        toast({ title: "Password updated successfully!" });
    };

    const getInitials = () => {
        const parts = profile.name.trim().split(" ");
        return parts.map((p) => p[0] ?? "").join("").toUpperCase().slice(0, 2) || "A";
    };

    return (
        <div className="space-y-6">
            {/* Page title */}
            <div>
                <h1 className="text-2xl font-extrabold text-foreground">Admin Profile</h1>
                <p className="text-sm text-muted-foreground">Manage your admin account details</p>
            </div>

            {/* Profile header card */}
            <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
                <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
                    <div className="relative shrink-0">
                        {avatarPreview ? (
                            <img
                                src={avatarPreview}
                                alt="Admin avatar"
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
                        <h2 className="text-2xl font-extrabold text-foreground">{profile.name}</h2>
                        <p className="text-sm text-muted-foreground">{profile.email}</p>
                        <span className="mt-1 inline-block rounded-full bg-primary/10 px-3 py-0.5 text-xs font-semibold text-primary">
                            {profile.role}
                        </span>
                    </div>
                </div>
            </div>

            {/* Edit form */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
                <div className="flex items-center gap-2 border-b border-border pb-3">
                    <UserCircle className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-bold text-foreground">Edit Details</h2>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                        <Label htmlFor="admin-name">Full Name</Label>
                        <Input
                            id="admin-name"
                            placeholder="Admin Name"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="admin-role">Role</Label>
                        <Input
                            id="admin-role"
                            placeholder="e.g. Super Admin, Manager"
                            value={form.role}
                            onChange={(e) => setForm({ ...form, role: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="admin-email">Email</Label>
                    <Input
                        id="admin-email"
                        type="email"
                        placeholder="admin@example.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="admin-phone">Phone</Label>
                    <Input
                        id="admin-phone"
                        placeholder="+92 300 0000000"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                </div>

                {/* Avatar picker */}
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
                            value={form.avatarUrl}
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
                    onClick={handleSave}
                    className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                    <Save className="h-4 w-4" /> Save Changes
                </Button>
            </div>

            {/* Change Password */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-border pb-3">
                    <Key className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-bold text-foreground">Change Password</h2>
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="apw-current">Current Password</Label>
                    <div className="relative">
                        <Input
                            id="apw-current"
                            type={showCurrent ? "text" : "password"}
                            placeholder="••••••••"
                            value={pwForm.current}
                            onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })}
                            className="pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowCurrent(!showCurrent)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="apw-new">New Password</Label>
                    <div className="relative">
                        <Input
                            id="apw-new"
                            type={showNew ? "text" : "password"}
                            placeholder="••••••••"
                            value={pwForm.newPw}
                            onChange={(e) => setPwForm({ ...pwForm, newPw: e.target.value })}
                            className="pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowNew(!showNew)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="apw-confirm">Confirm New Password</Label>
                    <div className="relative">
                        <Input
                            id="apw-confirm"
                            type={showConfirm ? "text" : "password"}
                            placeholder="••••••••"
                            value={pwForm.confirm}
                            onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                            className="pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>

                <Button variant="outline" onClick={handleChangePassword} className="gap-2">
                    <Key className="h-4 w-4" /> Update Password
                </Button>
            </div>
        </div>
    );
};

export default AdminProfilePage;
