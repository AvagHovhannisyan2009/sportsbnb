import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, User, Building, Eye, EyeOff, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const signupSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
  email: z.string().trim().email("Please enter a valid email address").max(255, "Email is too long"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const SignupPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState<"player" | "owner">("player");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    const password = formData.password;
    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^a-zA-Z0-9]/.test(password),
    };

    if (checks.length) score += 20;
    if (checks.lowercase) score += 20;
    if (checks.uppercase) score += 20;
    if (checks.number) score += 20;
    if (checks.special) score += 20;

    return { score, checks };
  }, [formData.password]);

  const getStrengthLabel = (score: number) => {
    if (score === 0) return { label: "", color: "" };
    if (score <= 20) return { label: "Very Weak", color: "bg-destructive" };
    if (score <= 40) return { label: "Weak", color: "bg-orange-500" };
    if (score <= 60) return { label: "Fair", color: "bg-yellow-500" };
    if (score <= 80) return { label: "Good", color: "bg-primary/70" };
    return { label: "Strong", color: "bg-primary" };
  };

  const validateField = (name: string, value: string) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case "name":
        if (value.length < 2) {
          newErrors.name = "Name must be at least 2 characters";
        } else {
          delete newErrors.name;
        }
        break;
      case "email":
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = "Please enter a valid email address";
        } else {
          delete newErrors.email;
        }
        break;
      case "password":
        if (value.length < 8) {
          newErrors.password = "Password must be at least 8 characters";
        } else {
          delete newErrors.password;
        }
        if (formData.confirmPassword && value !== formData.confirmPassword) {
          newErrors.confirmPassword = "Passwords don't match";
        } else if (formData.confirmPassword) {
          delete newErrors.confirmPassword;
        }
        break;
      case "confirmPassword":
        if (value !== formData.password) {
          newErrors.confirmPassword = "Passwords don't match";
        } else {
          delete newErrors.confirmPassword;
        }
        break;
    }
    
    setErrors(newErrors);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const result = signupSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsLoading(true);
    
    const { error } = await supabase.auth.signUp({
      email: formData.email.trim(),
      password: formData.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: formData.name.trim(),
          user_type: userType,
        },
      },
    });

    if (error) {
      toast.error(error.message);
      setIsLoading(false);
      return;
    }

    toast.success("Account created successfully!");
    // Redirect to appropriate onboarding flow
    if (userType === "player") {
      navigate("/onboarding/player");
    } else {
      navigate("/onboarding/owner");
    }
    setIsLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/onboarding/player`,
      },
    });

    if (error) {
      toast.error(error.message);
      setIsLoading(false);
    }
  };

  const strengthInfo = getStrengthLabel(passwordStrength.score);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-secondary p-12 flex-col justify-between">
        <div>
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <span className="text-lg font-bold text-primary-foreground">S</span>
            </div>
            <span className="text-xl font-semibold text-secondary-foreground">Sportsbnb</span>
          </Link>
        </div>
        
        <div className="max-w-md">
          <h1 className="text-4xl font-bold text-secondary-foreground mb-4">
            Join thousands of players and venue owners
          </h1>
          <p className="text-lg text-secondary-foreground/70">
            Book sports facilities instantly, find games, and connect with your local sports community.
          </p>
        </div>
        
        <div className="text-sm text-secondary-foreground/50">
          © {new Date().getFullYear()} Sportsbnb
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link
            to="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to home
          </Link>

          <h2 className="text-2xl font-bold text-foreground mb-2">Create your account</h2>
          <p className="text-muted-foreground mb-8">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>

          {/* Google Sign Up Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 mb-6"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* User Type Selection */}
            <div className="space-y-3">
              <Label>I want to</Label>
              <RadioGroup
                value={userType}
                onValueChange={(value) => setUserType(value as "player" | "owner")}
                className="grid grid-cols-2 gap-4"
              >
                <div>
                  <RadioGroupItem
                    value="player"
                    id="player"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="player"
                    className="flex flex-col items-center justify-center rounded-xl border-2 border-input bg-card p-6 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer"
                  >
                    <User className="h-8 w-8 mb-2" />
                    <span className="font-medium">Play Sports</span>
                    <span className="text-xs text-muted-foreground mt-1">Book venues & join games</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem
                    value="owner"
                    id="owner"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="owner"
                    className="flex flex-col items-center justify-center rounded-xl border-2 border-input bg-card p-6 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer"
                  >
                    <Building className="h-8 w-8 mb-2" />
                    <span className="font-medium">List Venues</span>
                    <span className="text-xs text-muted-foreground mt-1">Manage your facilities</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">
                {userType === "player" ? "Full name" : "Business name"}
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder={userType === "player" ? "John Doe" : "My Sports Center"}
                value={formData.name}
                onChange={handleChange}
                className={`h-12 ${errors.name ? "border-destructive focus-visible:ring-destructive" : ""}`}
                required
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                className={`h-12 ${errors.email ? "border-destructive focus-visible:ring-destructive" : ""}`}
                required
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`h-12 pr-10 ${errors.password ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {formData.password && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Progress value={passwordStrength.score} className="h-2 flex-1" />
                    {strengthInfo.label && (
                      <span className={`text-xs font-medium ${passwordStrength.score >= 80 ? "text-primary" : passwordStrength.score >= 60 ? "text-yellow-600" : "text-destructive"}`}>
                        {strengthInfo.label}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    {[
                      { key: "length", label: "8+ characters" },
                      { key: "lowercase", label: "Lowercase letter" },
                      { key: "uppercase", label: "Uppercase letter" },
                      { key: "number", label: "Number" },
                      { key: "special", label: "Special character" },
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center gap-1">
                        {passwordStrength.checks[key as keyof typeof passwordStrength.checks] ? (
                          <Check className="h-3 w-3 text-primary" />
                        ) : (
                          <X className="h-3 w-3 text-muted-foreground" />
                        )}
                        <span className={passwordStrength.checks[key as keyof typeof passwordStrength.checks] ? "text-foreground" : "text-muted-foreground"}>
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`h-12 pr-10 ${errors.confirmPassword ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword}</p>
              )}
              {formData.confirmPassword && formData.password === formData.confirmPassword && !errors.confirmPassword && (
                <p className="text-sm text-primary flex items-center gap-1">
                  <Check className="h-4 w-4" /> Passwords match
                </p>
              )}
            </div>

            <Button type="submit" className="w-full h-12" size="lg" disabled={isLoading || Object.keys(errors).length > 0}>
              {isLoading ? "Creating account..." : "Create account"}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              By creating an account, you agree to our{" "}
              <Link to="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;