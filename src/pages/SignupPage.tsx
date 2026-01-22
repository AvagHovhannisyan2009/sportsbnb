import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, User, Building, Eye, EyeOff, Check, X, Mail, Lock, UserCircle, Users, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { getGenericAuthError } from "@/lib/authErrors";
import authHero from "@/assets/auth-hero.jpg";

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
  const { t } = useTranslation();
  const { user, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
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

  // Redirect if already authenticated (but not if we just signed up)
  useEffect(() => {
    if (!authLoading && user && !isSigningUp) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, authLoading, navigate, isSigningUp]);

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
    if (score <= 20) return { label: t('auth.passwordWeak'), color: "text-destructive" };
    if (score <= 40) return { label: t('auth.passwordWeak'), color: "text-orange-500" };
    if (score <= 60) return { label: t('auth.passwordFair'), color: "text-yellow-500" };
    if (score <= 80) return { label: t('auth.passwordGood'), color: "text-primary/70" };
    return { label: t('auth.passwordStrong'), color: "text-primary" };
  };

  const validateField = (name: string, value: string) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case "name":
        if (value.length < 2) {
          newErrors.name = t('auth.errors.invalidEmail');
        } else {
          delete newErrors.name;
        }
        break;
      case "email":
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = t('auth.errors.invalidEmail');
        } else {
          delete newErrors.email;
        }
        break;
      case "password":
        if (value.length < 8) {
          newErrors.password = t('auth.errors.invalidPassword');
        } else {
          delete newErrors.password;
        }
        if (formData.confirmPassword && value !== formData.confirmPassword) {
          newErrors.confirmPassword = t('auth.errors.passwordMismatch');
        } else if (formData.confirmPassword) {
          delete newErrors.confirmPassword;
        }
        break;
      case "confirmPassword":
        if (value !== formData.password) {
          newErrors.confirmPassword = t('auth.errors.passwordMismatch');
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
      toast.error(t('errors.validation'));
      return;
    }

    setIsLoading(true);
    setIsSigningUp(true);
    
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
      toast.error(getGenericAuthError(error, 'signup'));
      setIsLoading(false);
      setIsSigningUp(false);
      return;
    }

    toast.success(t('common.success'));
    // Redirect to appropriate page with replace to prevent back navigation issues
    if (userType === "player") {
      navigate("/onboarding/player", { replace: true });
    } else {
      // Owners go directly to dashboard, they can add venues from there
      navigate("/owner-dashboard", { replace: true });
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
      toast.error(getGenericAuthError(error, 'signup'));
      setIsLoading(false);
    }
  };

  // Show loading while checking auth state
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const strengthInfo = getStrengthLabel(passwordStrength.score);

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Emotional Brand Side */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background Image */}
        <img
          src={authHero}
          alt="Athletes playing sports"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-10 lg:p-14 w-full">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/30 transition-transform group-hover:scale-105">
              <span className="text-lg font-bold text-primary-foreground">S</span>
            </div>
            <span className="text-xl font-semibold text-white">Sportsbnb</span>
          </Link>
          
          {/* Hero Text */}
          <div className="max-w-lg">
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-5 leading-tight tracking-tight">
              {t('home.heroTitle')}<br />{t('home.heroHighlight')}
            </h1>
            <p className="text-lg text-white/80 leading-relaxed">
              {t('home.heroDescription')}
            </p>
            
            {/* Trust Indicators */}
            <div className="flex items-center gap-6 mt-8">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-white/70 text-sm">10,000+ {t('common.players')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="text-white/70 text-sm">{t('home.joinCommunity')}</span>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="text-sm text-white/40">
            {t('footer.copyright', { year: new Date().getFullYear() })}
          </div>
        </div>
      </div>

      {/* Right Panel - Form Side */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-12 bg-background overflow-y-auto">
        <div className="w-full max-w-md py-8">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <span className="text-lg font-bold text-primary-foreground">S</span>
              </div>
              <span className="text-xl font-semibold text-foreground">Sportsbnb</span>
            </Link>
          </div>

          <Link
            to="/"
            className="hidden lg:inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.back')}
          </Link>

          {/* Welcome Header */}
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-foreground mb-2 tracking-tight">{t('auth.createAccount')}</h2>
            <p className="text-muted-foreground">
              {t('home.joinCommunity')}
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-card rounded-2xl border border-border/50 shadow-xl shadow-black/5 p-6 lg:p-8">
            {/* Google Sign Up Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 text-base font-medium border-2 hover:bg-accent transition-all"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {t('auth.continueWithGoogle')}
            </Button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-card px-4 text-xs text-muted-foreground uppercase tracking-wider">
                  {t('auth.orContinueWith')}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* User Type Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">{t('auth.userType')}</Label>
                <RadioGroup
                  value={userType}
                  onValueChange={(value) => setUserType(value as "player" | "owner")}
                  className="grid grid-cols-2 gap-3"
                >
                  <div>
                    <RadioGroupItem
                      value="player"
                      id="player"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="player"
                      className="flex flex-col items-center justify-center rounded-xl border-2 border-input bg-background p-4 hover:bg-accent/50 hover:border-primary/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all"
                    >
                      <User className="h-6 w-6 mb-2 text-muted-foreground peer-data-[state=checked]:text-primary" />
                      <span className="font-medium text-sm">{t('auth.playerType')}</span>
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
                      className="flex flex-col items-center justify-center rounded-xl border-2 border-input bg-background p-4 hover:bg-accent/50 hover:border-primary/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all"
                    >
                      <Building className="h-6 w-6 mb-2 text-muted-foreground peer-data-[state=checked]:text-primary" />
                      <span className="font-medium text-sm">{t('auth.ownerType')}</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  {t('auth.fullName')}
                </Label>
                <div className="relative">
                  <UserCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder={t('auth.fullNamePlaceholder')}
                    value={formData.name}
                    onChange={handleChange}
                    className={`h-12 pl-11 text-base border-2 transition-colors ${errors.name ? "border-destructive focus:border-destructive" : "focus:border-primary"}`}
                    required
                  />
                </div>
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">{t('auth.email')}</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder={t('auth.emailPlaceholder')}
                    value={formData.email}
                    onChange={handleChange}
                    className={`h-12 pl-11 text-base border-2 transition-colors ${errors.email ? "border-destructive focus:border-destructive" : "focus:border-primary"}`}
                    required
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">{t('auth.password')}</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t('auth.passwordPlaceholder')}
                    value={formData.password}
                    onChange={handleChange}
                    className={`h-12 pl-11 pr-11 text-base border-2 transition-colors ${errors.password ? "border-destructive focus:border-destructive" : "focus:border-primary"}`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {formData.password && (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center gap-2">
                      <Progress value={passwordStrength.score} className="h-1.5 flex-1" />
                      <span className={`text-xs font-medium ${strengthInfo.color}`}>
                        {strengthInfo.label}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 text-xs">
                      <div className={`flex items-center gap-1 ${passwordStrength.checks.length ? "text-primary" : "text-muted-foreground"}`}>
                        {passwordStrength.checks.length ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        {t('auth.passwordRequirements.length')}
                      </div>
                      <div className={`flex items-center gap-1 ${passwordStrength.checks.uppercase ? "text-primary" : "text-muted-foreground"}`}>
                        {passwordStrength.checks.uppercase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        {t('auth.passwordRequirements.uppercase')}
                      </div>
                      <div className={`flex items-center gap-1 ${passwordStrength.checks.lowercase ? "text-primary" : "text-muted-foreground"}`}>
                        {passwordStrength.checks.lowercase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        {t('auth.passwordRequirements.lowercase')}
                      </div>
                      <div className={`flex items-center gap-1 ${passwordStrength.checks.number ? "text-primary" : "text-muted-foreground"}`}>
                        {passwordStrength.checks.number ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        {t('auth.passwordRequirements.number')}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">{t('auth.confirmPassword')}</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder={t('auth.confirmPasswordPlaceholder')}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`h-12 pl-11 pr-11 text-base border-2 transition-colors ${errors.confirmPassword ? "border-destructive focus:border-destructive" : "focus:border-primary"}`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-medium shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? t('common.loading') : t('auth.createAccount')}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                {t('auth.termsAgree')}{" "}
                <Link to="/terms" className="text-primary hover:underline">
                  {t('common.terms')}
                </Link>{" "}
                {t('auth.and')}{" "}
                <Link to="/privacy" className="text-primary hover:underline">
                  {t('common.privacy')}
                </Link>
              </p>
            </form>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {t('auth.alreadyHaveAccount')}{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              {t('auth.signIn')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
