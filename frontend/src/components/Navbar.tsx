import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, Search, X, Home, Info, UtensilsCrossed, Phone, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { menuItems } from "@/data/menuItems";
import { Link } from "react-router-dom";

const navLinks = [
  { label: "Home", href: "/", icon: Home },
  { label: "Menu", href: "/menu", icon: BookOpen },
  { label: "About", href: "#about", icon: Info },
  { label: "Services", href: "#services", icon: UtensilsCrossed },
  { label: "Contact Us", href: "#contactus", icon: Phone },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<typeof menuItems>([]);
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (href: string) => {
    if (href.startsWith("#")) {
      // If we're on the homepage, scroll to section
      if (location.pathname === "/") {
        const el = document.querySelector(href);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        // Navigate to homepage then scroll
        navigate("/" + href);
      }
    } else {
      navigate(href);
    }
    setOpen(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.trim()) {
      const filtered = menuItems.filter(item => 
        item.name.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    setSuggestions([]);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/menu?q=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate("/menu");
    }
    setOpen(false);
    setSuggestions([]);
  };

  return (
    <nav className="sticky top-16 z-40 border-b border-border bg-card/95 backdrop-blur">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        {/* Desktop links */}
        <ul className="hidden gap-6 md:flex">
          {navLinks.map((link) => (
            <li key={link.label}>
              <button
                onClick={() => handleNavClick(link.href)}
                className="flex items-center gap-1.5 text-sm font-bold text-muted-foreground transition-colors hover:text-primary"
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </button>
            </li>
          ))}
        </ul>

        {/* Desktop Search */}
        <form onSubmit={handleSearch} className="hidden items-center gap-2 md:flex">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search menu..."
              className="h-9 w-56 pl-9 pr-8 text-sm"
            />
            {suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 w-full rounded-md border border-border bg-popover shadow-md overflow-hidden z-50">
                <ul className="max-h-60 overflow-auto">
                  {suggestions.map((item) => (
                    <li key={item.id} className="border-b border-border last:border-0">
                      <button
                        type="button"
                        onClick={() => {
                          navigate(`/menu?q=${encodeURIComponent(item.name)}`);
                          clearSearch();
                        }}
                        className="flex w-full items-center gap-2 p-2 text-sm hover:bg-muted/50 text-left transition-colors"
                      >
                       <img 
                          src={item.image} 
                          alt={item.name} 
                          className="h-8 w-8 rounded object-cover"
                        />
                        <span className="truncate flex-1 font-medium text-foreground">{item.name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {searchTerm && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <Button
            type="submit"
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
          >
            <Search className="h-4 w-4" />
          </Button>
        </form>

        {/* Mobile hamburger */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <SheetTitle className="text-lg font-bold text-primary">Menu</SheetTitle>
            <ul className="mt-6 space-y-3">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => handleNavClick(link.href)}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-base font-bold text-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                  >
                    <link.icon className="h-5 w-5" />
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
            <form onSubmit={handleSearch} className="mt-6 relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search menu..."
                className="pl-9"
              />
              {suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 w-full rounded-md border border-border bg-popover shadow-md overflow-hidden z-50">
                  <ul className="max-h-60 overflow-auto">
                    {suggestions.map((item) => (
                      <li key={item.id} className="border-b border-border last:border-0">
                        <button
                          type="button"
                          onClick={() => {
                            navigate(`/menu?q=${encodeURIComponent(item.name)}`);
                            setOpen(false);
                            setSuggestions([]);
                          }}
                          className="flex w-full items-center gap-3 p-3 text-sm hover:bg-muted/50 text-left transition-colors"
                        >
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="h-10 w-10 rounded object-cover"
                          />
                          <div className="flex flex-col">
                            <span className="font-semibold text-foreground">{item.name}</span>
                            <span className="text-xs text-muted-foreground">{item.price}</span>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </form>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};

export default Navbar;
