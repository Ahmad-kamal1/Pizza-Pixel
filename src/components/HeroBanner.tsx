import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import heroPizza from "@/assets/hero-pizza.jpg";

const HeroBanner = () => {
  const navigate = useNavigate();

  return (
    <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden">
      <img
        src={heroPizza}
        alt="Delicious pepperoni pizza on rustic table"
        className="absolute inset-0 h-full w-full object-cover"
        loading="eager"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
      <div className="relative z-10 flex flex-col items-center gap-6 px-4 text-center animate-fade-in">
        <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white drop-shadow-lg sm:text-5xl md:text-6xl lg:text-7xl">
          Crafted Pixel by Pixel,
          <br />
          <span className="text-accent">Baked to Perfection</span>
        </h1>
        <p className="max-w-lg text-lg text-white/80">
          Artisan pizzas made with love, fresh ingredients, and a touch of pixel magic.
        </p>
        <Button
          size="lg"
          className="bg-primary px-8 text-lg font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 hover-scale"
          onClick={() => navigate("/menu")}
        >
          View Menu
        </Button>
      </div>
    </section>
  );
};

export default HeroBanner;
