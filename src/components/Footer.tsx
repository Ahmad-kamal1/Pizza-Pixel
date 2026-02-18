import { Pizza, MapPin, Phone, Mail, Facebook, Instagram, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-foreground text-background">
      <div className="container mx-auto grid gap-8 px-4 py-12 md:grid-cols-3">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2">
            <Pizza className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">
              Pizza <span className="text-primary">Pixel</span>
            </span>
          </div>
          <p className="mt-3 text-sm opacity-70">
            Crafted pixel by pixel, baked to perfection. Serving the best artisan
            pizzas since 2020.
          </p>
        </div>

        {/* Contact */}
        <div>
          <h4 className="mb-4 font-semibold">Contact Us</h4>
          <ul className="space-y-3 text-sm opacity-80">
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              123 Pixel Lane, Byte City, CA 90210
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" />
              (555) 123-4567
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              hello@pizzapixel.com
            </li>
          </ul>
        </div>

        {/* Social */}
        <div>
          <h4 className="mb-4 font-semibold">Follow Us</h4>
          <div className="flex gap-4">
            <a href="#" aria-label="Facebook" className="rounded-full bg-background/10 p-2.5 transition-colors hover:bg-primary hover:text-primary-foreground">
              <Facebook className="h-5 w-5" />
            </a>
            <a href="#" aria-label="Instagram" className="rounded-full bg-background/10 p-2.5 transition-colors hover:bg-primary hover:text-primary-foreground">
              <Instagram className="h-5 w-5" />
            </a>
            <a href="#" aria-label="Twitter" className="rounded-full bg-background/10 p-2.5 transition-colors hover:bg-primary hover:text-primary-foreground">
              <Twitter className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-background/10 py-4 text-center text-sm opacity-50">
        © 2025 Pizza Pixel. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
