import { useState, useRef } from "react";
import { useAdmin, Category } from "@/context/AdminContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, FolderOpen, Link2, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const emptyForm = { name: "", emoji: "🍕", description: "", image: "" };

const EMOJI_PRESETS = ["🍕", "🍔", "🌯", "🥪", "🥤", "🍰", "🍟", "🍜", "🥗", "🍣", "🫔", "🧁"];

const AdminCategories = () => {
    const { categories, items, addCategory, editCategory, deleteCategory } = useAdmin();
    const [formOpen, setFormOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [editing, setEditing] = useState<Category | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [formError, setFormError] = useState("");
    const [imageTab, setImageTab] = useState<"url" | "upload">("url");
    const [imagePreview, setImagePreview] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const handleImageUrlChange = (url: string) => {
        setForm((f) => ({ ...f, image: url }));
        setImagePreview(url);
    };

    const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            setImagePreview(result);
            setForm((f) => ({ ...f, image: result }));
        };
        reader.readAsDataURL(file);
    };

    const getItemCount = (catName: string) =>
        items.filter((i) => (i as any).category === catName).length;

    const openAdd = () => {
        setEditing(null);
        setForm(emptyForm);
        setFormError("");
        setImagePreview("");
        setImageTab("url");
        setFormOpen(true);
    };

    const openEdit = (cat: Category) => {
        setEditing(cat);
        setForm({ name: cat.name, emoji: cat.emoji, description: cat.description, image: (cat as any).image ?? "" });
        setFormError("");
        setImagePreview((cat as any).image ?? "");
        setImageTab("url");
        setFormOpen(true);
    };

    const handleSave = async () => {
        if (!form.name.trim()) {
            setFormError("Category name is required.");
            return;
        }
        const payload = {
            name: form.name.trim(),
            emoji: form.emoji || "🍕",
            description: form.description.trim(),
            image: imagePreview,
        };

        try {
            if (editing) {
                await editCategory({ ...editing, ...payload });
                toast({ title: "Category updated successfully" });
            } else {
                await addCategory(payload);
                toast({ title: "Category added successfully" });
            }
            setFormOpen(false);
        } catch (err: any) {
            console.error(err);
            setFormError(err.message || "Failed to save category. Please check your connection.");
        }
    };

    return (
        <div className="space-y-6">
            {/* Page header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold text-foreground">Categories</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage your menu categories
                    </p>
                </div>
                <Button
                    onClick={openAdd}
                    className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                    <Plus className="h-4 w-4" />
                    Add Category
                </Button>
            </div>

            {/* Category Cards Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {categories.map((cat) => (
                    <div
                        key={cat.id}
                        className="group relative rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md"
                    >
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-3xl shadow-sm">
                                {cat.emoji}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-foreground truncate">{cat.name}</h3>
                                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                    {cat.description || "No description"}
                                </p>
                                <Badge
                                    variant="outline"
                                    className="mt-2 text-xs text-muted-foreground"
                                >
                                    {getItemCount(cat.name)} items
                                </Badge>
                            </div>
                        </div>
                        <div className="absolute right-4 top-4 flex gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEdit(cat)}
                                className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                            >
                                <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteId(cat.id)}
                                className="h-7 w-7 rounded-lg text-destructive hover:bg-destructive/10"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>
                ))}

                {/* Add placeholder card */}
                <button
                    onClick={openAdd}
                    className="group flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-transparent p-5 text-muted-foreground transition-all hover:border-primary hover:bg-primary/5 hover:text-primary"
                >
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted transition-colors group-hover:bg-primary/10">
                        <Plus className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-medium">Add Category</span>
                </button>
            </div>

            {/* Table view */}
            <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                <div className="flex items-center justify-between border-b border-border px-6 py-4">
                    <h2 className="font-bold text-foreground">All Categories</h2>
                    <Badge variant="outline" className="text-muted-foreground">
                        {categories.length} total
                    </Badge>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border bg-muted/40">
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Category
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Description
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Items
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-16 text-center">
                                        <FolderOpen className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
                                        <p className="text-muted-foreground">No categories yet</p>
                                    </td>
                                </tr>
                            ) : (
                                categories.map((cat) => (
                                    <tr
                                        key={cat.id}
                                        className="border-b border-border/50 transition-colors hover:bg-muted/30 last:border-0"
                                    >
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xl">{cat.emoji}</span>
                                                <span className="font-semibold text-foreground">{cat.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 text-muted-foreground">
                                            {cat.description || "—"}
                                        </td>
                                        <td className="px-6 py-3">
                                            <Badge variant="outline" className="text-xs text-muted-foreground">
                                                {getItemCount(cat.name)}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => openEdit(cat)}
                                                    className="h-8 gap-1.5 text-muted-foreground hover:text-foreground"
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setDeleteId(cat.id)}
                                                    className="h-8 gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                    Delete
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

            {/* Add / Edit Dialog */}
            <Dialog open={formOpen} onOpenChange={setFormOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>{editing ? "Edit Category" : "Add Category"}</DialogTitle>
                        <DialogDescription>
                            {editing ? "Update the category details." : "Create a new menu category."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        {formError && (
                            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                                {formError}
                            </p>
                        )}
                        {/* Emoji picker */}
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                                Icon (Emoji)
                            </label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {EMOJI_PRESETS.map((e) => (
                                    <button
                                        key={e}
                                        type="button"
                                        onClick={() => setForm({ ...form, emoji: e })}
                                        className={`h-9 w-9 rounded-xl text-xl transition-all ${form.emoji === e
                                            ? "bg-primary/20 ring-2 ring-primary"
                                            : "bg-muted hover:bg-muted/80"
                                            }`}
                                    >
                                        {e}
                                    </button>
                                ))}
                            </div>
                            <Input
                                placeholder="Or type any emoji..."
                                value={form.emoji}
                                onChange={(e) => setForm({ ...form, emoji: e.target.value })}
                                className="w-24"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                Name *
                            </label>
                            <Input
                                placeholder="e.g. Pizzas"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                            />
                        </div>
                        {/* Dual image picker */}
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                                Category Image (optional)
                            </label>
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
                                    placeholder="https://example.com/category.jpg"
                                    value={form.image.startsWith("data:") ? "" : form.image}
                                    onChange={(e) => handleImageUrlChange(e.target.value)}
                                />
                            ) : (
                                <div
                                    className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 p-4 text-muted-foreground transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Upload className="h-5 w-5" />
                                    <p className="text-xs font-medium">Click to upload from device</p>
                                    <p className="text-xs opacity-60">PNG, JPG, WEBP</p>
                                </div>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageFileUpload}
                            />

                            {imagePreview && (
                                <div className="flex items-center gap-3 mt-2">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="h-12 w-12 rounded-xl object-cover border border-border"
                                        onError={() => setImagePreview("")}
                                    />
                                    <span className="text-xs text-muted-foreground">Preview</span>
                                    <button
                                        type="button"
                                        onClick={() => { setImagePreview(""); setForm({ ...form, image: "" }); }}
                                        className="ml-auto text-xs text-destructive hover:underline"
                                    >
                                        Remove
                                    </button>
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                Description
                            </label>
                            <Input
                                placeholder="Short description"
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setFormOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                            {editing ? "Save Changes" : "Add Category"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirm */}
            <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Category?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently remove this category. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => {
                                if (deleteId !== null) deleteCategory(deleteId);
                                setDeleteId(null);
                            }}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default AdminCategories;
