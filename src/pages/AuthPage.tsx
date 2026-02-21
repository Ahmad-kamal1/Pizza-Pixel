import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Pizza, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiLogin, apiRegister } from "@/lib/api";

const AuthPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { toast } = useToast();

    const initialTab = searchParams.get("tab") === "signup" ? "signup" : "login";
    const [activeTab, setActiveTab] = useState(initialTab);
    const [loading, setLoading] = useState(false);

    // Login state
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [showLoginPassword, setShowLoginPassword] = useState(false);

    // Sign Up state
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [signupEmail, setSignupEmail] = useState("");
    const [signupPassword, setSignupPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showSignupPassword, setShowSignupPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Redirect if already logged in
    useEffect(() => {
        const currentUser = localStorage.getItem("pizzaPixelCurrentUser");
        if (currentUser) navigate("/");
    }, [navigate]);

    const validateEmail = (email: string) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const email = loginEmail.trim();
        const password = loginPassword;

        if (!email || !password) {
            toast({ title: "Please fill in all fields", variant: "destructive" });
            return;
        }
        if (!validateEmail(email)) {
            toast({ title: "Please enter a valid email", variant: "destructive" });
            return;
        }

        setLoading(true);
        try {
            const user = await apiLogin(email, password);
            localStorage.setItem("pizzaPixelCurrentUser", JSON.stringify({
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                avatar: user.avatar || "",
                role: user.role,
            }));
            window.dispatchEvent(new Event("pizzaPixelAuthChange"));
            toast({ title: `Welcome back, ${user.firstName}!` });
            navigate("/");
        } catch (err: any) {
            toast({ title: err.message || "Invalid credentials", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        const fName = firstName.trim();
        const lName = lastName.trim();
        const email = signupEmail.trim();
        const password = signupPassword;
        const confirm = confirmPassword;

        if (!fName || !lName || !email || !password || !confirm) {
            toast({ title: "Please fill in all fields", variant: "destructive" });
            return;
        }
        if (!validateEmail(email)) {
            toast({ title: "Please enter a valid email", variant: "destructive" });
            return;
        }
        if (password.length < 6) {
            toast({ title: "Password must be at least 6 characters", variant: "destructive" });
            return;
        }
        if (password !== confirm) {
            toast({ title: "Passwords don't match", variant: "destructive" });
            return;
        }

        setLoading(true);
        try {
            const user = await apiRegister({ firstName: fName, lastName: lName, email, password });
            localStorage.setItem("pizzaPixelCurrentUser", JSON.stringify({
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                avatar: "",
                role: "customer",
            }));
            window.dispatchEvent(new Event("pizzaPixelAuthChange"));
            toast({ title: `Welcome, ${fName}! Your account has been created.` });
            navigate("/");
        } catch (err: any) {
            toast({ title: err.message || "Registration failed", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
            {/* Decorative background */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
            </div>

            <div className="relative z-10 w-full max-w-md animate-fade-in">
                {/* Logo */}
                <div
                    className="mb-8 flex cursor-pointer items-center justify-center gap-2"
                    onClick={() => navigate("/")}
                >
                    <Pizza className="h-10 w-10 text-primary" />
                    <span className="text-2xl font-bold tracking-tight text-foreground">
                        Pizza <span className="text-primary">Pixel</span>
                    </span>
                </div>

                {/* Auth Card */}
                <div className="rounded-2xl border border-border bg-card p-8 shadow-xl shadow-primary/5">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-2 mb-6">
                            <TabsTrigger
                                value="login"
                                className="font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                            >
                                Login
                            </TabsTrigger>
                            <TabsTrigger
                                value="signup"
                                className="font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                            >
                                Sign Up
                            </TabsTrigger>
                        </TabsList>

                        {/* LOGIN TAB */}
                        <TabsContent value="login">
                            <form onSubmit={handleLogin} className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="login-email">Email</Label>
                                    <Input
                                        id="login-email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={loginEmail}
                                        onChange={(e) => setLoginEmail(e.target.value)}
                                        className="h-11"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="login-password">Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="login-password"
                                            type={showLoginPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={loginPassword}
                                            onChange={(e) => setLoginPassword(e.target.value)}
                                            className="h-11 pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowLoginPassword(!showLoginPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-base shadow-lg shadow-primary/20"
                                >
                                    {loading ? "Logging in…" : "Login"}
                                </Button>
                                <p className="text-center text-sm text-muted-foreground">
                                    Don't have an account?{" "}
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab("signup")}
                                        className="font-semibold text-primary hover:underline"
                                    >
                                        Sign Up
                                    </button>
                                </p>
                            </form>
                        </TabsContent>

                        {/* SIGN UP TAB */}
                        <TabsContent value="signup">
                            <form onSubmit={handleSignUp} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="first-name">First Name</Label>
                                        <Input
                                            id="first-name"
                                            placeholder="John"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            className="h-11"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="last-name">Last Name</Label>
                                        <Input
                                            id="last-name"
                                            placeholder="Doe"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            className="h-11"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="signup-email">Email</Label>
                                    <Input
                                        id="signup-email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={signupEmail}
                                        onChange={(e) => setSignupEmail(e.target.value)}
                                        className="h-11"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="signup-password">Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="signup-password"
                                            type={showSignupPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={signupPassword}
                                            onChange={(e) => setSignupPassword(e.target.value)}
                                            className="h-11 pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowSignupPassword(!showSignupPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {showSignupPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirm-password">Confirm Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="confirm-password"
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="h-11 pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-base shadow-lg shadow-primary/20"
                                >
                                    {loading ? "Creating account…" : "Create Account"}
                                </Button>
                                <p className="text-center text-sm text-muted-foreground">
                                    Already have an account?{" "}
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab("login")}
                                        className="font-semibold text-primary hover:underline"
                                    >
                                        Login
                                    </button>
                                </p>
                            </form>
                        </TabsContent>
                    </Tabs>
                </div>

                <p className="mt-6 text-center text-xs text-muted-foreground">
                    © 2025 Pizza Pixel. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default AuthPage;
