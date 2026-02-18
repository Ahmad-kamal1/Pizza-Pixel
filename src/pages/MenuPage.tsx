import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { menuItems, MenuItem } from "@/data/menuItems";

const MenuPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const queryParam = searchParams.get("q") || "";
    const [search, setSearch] = useState(queryParam);
    const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
    const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        setSearch(searchParams.get("q") || "");
    }, [searchParams]);

    const filteredItems = menuItems.filter((item) => {
        if (!search.trim()) return true;
        const q = search.trim().toLowerCase();
        return (
            item.name.toLowerCase().includes(q) ||
            item.description.toLowerCase().includes(q)
        );
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (search.trim()) {
            setSearchParams({ q: search.trim() });
        } else {
            setSearchParams({});
        }
    };

    const clearSearch = () => {
        setSearch("");
        setSearchParams({});
    };

    const toggleItem = (id: number) => {
        const newSelected = new Set(selectedItems);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedItems(newSelected);
    };

    const getSelectedItemsDetails = () => {
        return menuItems.filter((item) => selectedItems.has(item.id));
    };

    const calculateTotal = () => {
        return getSelectedItemsDetails()
            .reduce((total, item) => {
                const price = parseFloat(item.price.replace("$", ""));
                return total + price;
            }, 0)
            .toFixed(2);
    };

    const handlePlaceOrder = () => {
        setIsOrderDialogOpen(false);
        setSelectedItems(new Set());
        toast({
            title: "Order Placed Successfully!",
            description: `Thank you for your order. Total: $${calculateTotal()}`,
            duration: 5000,
        });
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <Navbar />

            <main className="py-12 md:py-20">
                <div className="container mx-auto px-4">
                    {/* Page Header */}
                    <div className="mb-10 text-center animate-fade-in">
                        <h1 className="text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
                            Our <span className="text-primary">Menu</span>
                        </h1>
                        <p className="mt-3 text-lg text-muted-foreground">
                            Explore our full collection of handcrafted pizzas, sides & more.
                        </p>
                    </div>

                    {/* Search Bar */}
                    <form
                        onSubmit={handleSearch}
                        className="mx-auto mb-10 flex max-w-lg items-center gap-2"
                    >
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search pizzas, sides, drinks..."
                                className="h-11 pl-10 pr-10 text-sm"
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={clearSearch}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                        <Button
                            type="submit"
                            className="h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                        >
                            Search
                        </Button>
                    </form>

                    {/* Results info */}
                    {queryParam && (
                        <p className="mb-6 text-center text-sm text-muted-foreground">
                            {filteredItems.length} result{filteredItems.length !== 1 ? "s" : ""} for "
                            <span className="font-semibold text-foreground">{queryParam}</span>"
                        </p>
                    )}

                    {/* Items Grid */}
                    {filteredItems.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pb-20">
                            {filteredItems.map((item, i) => (
                                <ProductCard
                                    key={item.id}
                                    item={item}
                                    index={i}
                                    isSelected={selectedItems.has(item.id)}
                                    onToggle={() => toggleItem(item.id)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <Search className="mb-4 h-16 w-16 text-muted-foreground/30" />
                            <h3 className="text-xl font-bold text-foreground">No items found</h3>
                            <p className="mt-2 text-muted-foreground">
                                Try searching for something else, or{" "}
                                <button
                                    onClick={clearSearch}
                                    className="font-semibold text-primary hover:underline"
                                >
                                    view all items
                                </button>
                            </p>
                        </div>
                    )}

                    {/* Order Floating Bar */}
                    {selectedItems.size > 0 && (
                        <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom border-t border-border bg-background/95 p-4 backdrop-blur shadow-lg">
                            <div className="container mx-auto flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-sm text-muted-foreground">
                                        {selectedItems.size} item{selectedItems.size !== 1 ? "s" : ""} selected
                                    </span>
                                    <span className="text-xl font-bold text-foreground">
                                        Total: ${calculateTotal()}
                                    </span>
                                </div>
                                <Button
                                    size="lg"
                                    onClick={() => setIsOrderDialogOpen(true)}
                                    className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-8"
                                >
                                    Order Now
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Order Summary Dialog */}
                    <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Order Summary</DialogTitle>
                                <DialogDescription>
                                    Review your selected items before placing the order.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="max-h-[60vh] overflow-y-auto my-4 space-y-4 pr-2">
                                {getSelectedItemsDetails().map((item) => (
                                    <div key={item.id} className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0">
                                        <div className="flex items-center gap-3">
                                            <img src={item.image} alt={item.name} className="h-12 w-12 rounded bg-muted object-cover" />
                                            <div>
                                                <p className="font-semibold text-foreground">{item.name}</p>
                                                <p className="text-sm text-muted-foreground">{item.price}</p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => toggleItem(item.id)}
                                            className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center justify-between border-t border-border pt-4">
                                <span className="font-semibold">Total Amount</span>
                                <span className="text-xl font-bold">${calculateTotal()}</span>
                            </div>
                            <DialogFooter className="mt-4 sm:justify-end gap-2">
                                <Button variant="outline" onClick={() => setIsOrderDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handlePlaceOrder} className="bg-primary text-primary-foreground hover:bg-primary/90">
                                    Confirm Order
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default MenuPage;
