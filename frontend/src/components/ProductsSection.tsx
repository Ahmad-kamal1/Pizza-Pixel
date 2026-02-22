import { useEffect, useState } from "react";
import { apiGetItems } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import { MenuItem } from "@/context/AdminContext"; // Reusing the type

const ProductsSection = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGetItems()
      .then((data) => setItems(data))
      .catch((err) => console.error("Failed to load products", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="services" className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
            Our <span className="text-primary">Menu</span>
          </h2>
          <p className="mt-3 text-muted-foreground">
            From classic pizzas to fresh sides — something for everyone.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center p-10"><span className="animate-spin text-2xl">🍕</span></div>
        ) : items.length === 0 ? (
          <div className="text-center text-muted-foreground">No menu items available.</div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item, i) => (
              <ProductCard key={item.id} item={item} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductsSection;
