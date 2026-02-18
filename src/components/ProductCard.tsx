import { useEffect, useRef, useState } from "react";
import type { MenuItem } from "@/data/menuItems";

interface ProductCardProps {
  item: MenuItem;
  index: number;
  isSelected?: boolean;
  onToggle?: () => void;
}

const ProductCard = ({ item, index, isSelected = false, onToggle }: ProductCardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`group overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-500 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        } ${isSelected ? "border-primary ring-2 ring-primary ring-offset-2" : "border-border"}`}
      style={{ transitionDelay: `${index * 60}ms` }}
    >
      <div className="relative overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-bold text-card-foreground">{item.name}</h3>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
            {item.price}
          </span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
        {onToggle && (
          <button
            onClick={onToggle}
            className={`mt-4 w-full rounded-md py-2 text-sm font-semibold transition-colors ${isSelected
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
              }`}
          >
            {isSelected ? "Remove from Bill" : "Add to Bill"}
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
