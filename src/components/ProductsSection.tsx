import { menuItems } from "@/data/menuItems";
import ProductCard from "@/components/ProductCard";

const ProductsSection = () => {
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
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {menuItems.map((item, i) => (
            <ProductCard key={item.id} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;
