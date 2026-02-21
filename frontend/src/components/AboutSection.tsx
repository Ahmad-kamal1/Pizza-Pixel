import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const features = [
  {
    image: "src/assets/chief.png",
    title: "Master Chefs",
    description: "Our chefs bring decades of Italian culinary expertise to every pie, crafting authentic flavors with a modern twist.",
  },
  {
    image: "src/assets/ingredients.jpg",
    title: "Fresh Ingredients",
    description: "We source locally grown vegetables, premium meats, and imported Italian cheeses for the freshest taste.",
  },
  {
    image: "src/assets/delivery.jpg",
    title: "Fast Delivery",
    description: "Hot pizza at your doorstep in 30 minutes or less — because great food shouldn't keep you waiting.",
  },
];

const AboutSection = () => {
  const [selectedFeature, setSelectedFeature] = useState<typeof features[0] | null>(null);

  return (
    <section id="about" className="bg-card py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
            About <span className="text-primary">Pizza Pixel</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Born from a love of wood-fired ovens and pixel art, Pizza Pixel is where tradition meets creativity. Since 2020, we've been serving handcrafted pizzas that look as good as they taste.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              onClick={() => setSelectedFeature(f)}
              className="group overflow-hidden rounded-2xl border border-border bg-background text-center transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 cursor-pointer"
            >
              <div className="h-48 w-full overflow-hidden">
                <img
                  src={f.image}
                  alt={f.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="p-8">
                <h3 className="mb-2 text-lg font-bold text-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={!!selectedFeature} onOpenChange={(open) => !open && setSelectedFeature(null)}>
        <DialogContent className="sm:max-w-[425px] flex flex-col items-center text-center p-0 overflow-hidden gap-0">
          {selectedFeature && (
            <>
              <div className="w-full h-64 overflow-hidden">
                <img
                  src={selectedFeature.image}
                  alt={selectedFeature.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 w-full">
                <DialogHeader className="mb-4">
                  <DialogTitle className="text-2xl font-bold text-center text-primary">{selectedFeature.title}</DialogTitle>
                </DialogHeader>
                <DialogDescription className="text-base text-foreground leading-relaxed">
                  {selectedFeature.description}
                </DialogDescription>
                <div className="mt-6 pt-6 border-t border-border w-full">
                  <p className="text-sm text-muted-foreground italic">
                    Experience the difference at Pizza Pixel.
                  </p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section >
  );
};

export default AboutSection;
