import { useState, useRef } from "react";
import { useAdmin, MenuItem } from "@/context/AdminContext";
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
import { Plus, Pencil, Trash2, Search, Package, Link2, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const emptyForm = {
    name: "",
    description: "",
    price: "",
    image: "",
    category: "Pizzas",
};

const AdminItems = () => {
    const { items, categories, addItem, editItem, deleteItem } = useAdmin();
    const [search, setSearch] = useState("");
    const [formOpen, setFormOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [editing, setEditing] = useState<MenuItem | null>(null);
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

    const filtered = items.filter(
        (item) =>
            item.name.toLowerCase().includes(search.toLowerCase()) ||
            item.description.toLowerCase().includes(search.toLowerCase())
    );

    const openAdd = () => {
        setEditing(null);
        setForm(emptyForm);
        setFormError("");
        setImagePreview("");
        setImageTab("url");
        setFormOpen(true);
    };

    const openEdit = (item: MenuItem) => {
        setEditing(item);
        setForm({
            name: item.name,
            description: item.description,
            price: item.price,
            image: item.image,
            category: (item as any).category ?? "Pizzas",
        });
        setFormError("");
        setImagePreview(item.image ?? "");
        setImageTab("url");
        setFormOpen(true);
    };

    const handleSave = async () => {
        if (!form.name.trim() || !form.price.trim()) {
            setFormError("Name and Price are required.");
            return;
        }
        const priceVal = form.price.startsWith("$") ? form.price : `$${form.price}`;
        const payload = {
            name: form.name.trim(),
            description: form.description.trim(),
            price: priceVal,
            image:
                form.image.trim() ||
                "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop",
            category: form.category || "Pizzas",
        };


        try {
            if (editing) {
                await editItem({ ...editing, ...payload, category: form.category || "Pizzas" });
                toast({ title: "Item updated successfully" });
            } else {
                await addItem(payload);
                toast({ title: "Item added successfully" });
            }

            setFormOpen(false);
        } catch (err: any) {
            console.error(err);
            setFormError(err.message || "Failed to save item. Please check your connection.");
        }
    };

    return (
        <div className="space-y-6">
            {/* Page header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold text-foreground">Menu Items</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage your restaurant's menu items
                    </p>
                </div>
                <Button
                    onClick={openAdd}
                    className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                    <Plus className="h-4 w-4" />
                    Add Item
                </Button>
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search items..."
                    className="pl-10"
                />
            </div>

            {/* Table */}
            <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                <div className="flex items-center justify-between border-b border-border px-6 py-4">
                    <h2 className="font-bold text-foreground">All Items</h2>
                    <Badge variant="outline" className="text-muted-foreground">
                        {filtered.length} item{filtered.length !== 1 ? "s" : ""}
                    </Badge>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border bg-muted/40">
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Item
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Description
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Price
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-16 text-center">
                                        <Package className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
                                        <p className="text-muted-foreground">No items found</p>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="border-b border-border/50 transition-colors hover:bg-muted/30 last:border-0"
                                    >
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="h-10 w-10 rounded-xl object-cover bg-muted"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src =
                                                            "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=80&h=80&fit=crop";
                                                    }}
                                                />
                                                <span className="font-semibold text-foreground">{item.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 max-w-xs text-muted-foreground truncate">
                                            {item.description}
                                        </td>
                                        <td className="px-6 py-3 font-bold text-primary">{item.price}</td>
                                        <td className="px-6 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => openEdit(item)}
                                                    className="h-8 gap-1.5 text-muted-foreground hover:text-foreground"
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setDeleteId(item.id)}
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
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editing ? "Edit Item" : "Add New Item"}</DialogTitle>
                        <DialogDescription>
                            {editing ? "Update the item details below." : "Fill in the details for the new menu item."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 py-2">
                        {formError && (
                            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                                {formError}
                            </p>
                        )}
                        <div>
                            <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                Name *
                            </label>
                            <Input
                                placeholder="e.g. Margherita Pizza"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                            />
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
                        <div>
                            <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                Price *
                            </label>
                            <Input
                                placeholder="e.g. 12.99"
                                value={form.price}
                                onChange={(e) => setForm({ ...form, price: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                Category
                            </label>
                            <select
                                value={form.category}
                                onChange={(e) => setForm({ ...form, category: e.target.value })}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                                {categories.map((c) => (
                                    <option key={c.id} value={c.name}>
                                        {c.emoji} {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {/* Dual image input */}
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                                Item Image
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
                                    placeholder="https://..."
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
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setFormOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                            {editing ? "Save Changes" : "Add Item"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirm */}
            <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Item?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently remove this menu item. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => {
                                if (deleteId !== null) deleteItem(deleteId);
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

export default AdminItems;
