import { Pizza, Moon, Sun, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface CurrentUser {
  firstName: string;
  lastName: string;
  email: string;
}

const Header = () => {
  const navigate = useNavigate();
  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return false;
  });

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  // Check for logged in user
  useEffect(() => {
    const check = () => {
      const data = localStorage.getItem("pizzaPixelCurrentUser");
      setCurrentUser(data ? JSON.parse(data) : null);
    };
    check();
    // Listen for storage changes (e.g. login/logout in another tab)
    window.addEventListener("storage", check);
    // Also listen for a custom event for same-tab updates
    window.addEventListener("pizzaPixelAuthChange", check);
    return () => {
      window.removeEventListener("storage", check);
      window.removeEventListener("pizzaPixelAuthChange", check);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("pizzaPixelCurrentUser");
    window.dispatchEvent(new Event("pizzaPixelAuthChange"));
    setCurrentUser(null);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <Pizza className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold tracking-tight text-foreground">
            Pizza <span className="text-primary">Pixel</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDark(!dark)}
            aria-label="Toggle dark mode"
          >
            {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {currentUser ? (
            <>
              <div className="hidden sm:flex items-center gap-2 text-sm font-semibold text-foreground">
                <User className="h-4 w-4 text-primary" />
                {currentUser.firstName} {currentUser.lastName}
              </div>
              <Button
                variant="ghost"
                className="text-foreground hover:text-destructive gap-1"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                className="text-foreground hover:text-primary font-semibold"
                onClick={() => navigate("/auth")}
              >
                Login
              </Button>
              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                onClick={() => navigate("/auth?tab=signup")}
              >
                Sign Up
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
