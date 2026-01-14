import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const LoginPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null);
  const [totpCode, setTotpCode] = useState("");
  const [isVerifyingMfa, setIsVerifyingMfa] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (error) {
      toast.error(error.message);
      setIsLoading(false);
      return;
    }

    // Check if MFA is required
    const { data: factorsData } = await supabase.auth.mfa.listFactors();
    const verifiedFactors = factorsData?.totp?.filter(f => f.status === 'verified') || [];
    
    if (verifiedFactors.length > 0) {
      // MFA is enabled, need to verify
      setMfaFactorId(verifiedFactors[0].id);
      setMfaRequired(true);
      setIsLoading(false);
      return;
    }

    // No MFA, proceed with normal login
    await handleLoginSuccess(data.user?.id);
    setIsLoading(false);
  };

  const handleMfaVerify = async () => {
    if (!mfaFactorId || totpCode.length !== 6) return;
    
    setIsVerifyingMfa(true);
    
    const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId: mfaFactorId,
    });

    if (challengeError) {
      toast.error("Failed to create MFA challenge");
      setIsVerifyingMfa(false);
      return;
    }

    const { data: verifyData, error: verifyError } = await supabase.auth.mfa.verify({
      factorId: mfaFactorId,
      challengeId: challengeData.id,
      code: totpCode,
    });

    if (verifyError) {
      toast.error("Invalid verification code");
      setTotpCode("");
      setIsVerifyingMfa(false);
      return;
    }

    // MFA verified, proceed with login
    const { data: { user } } = await supabase.auth.getUser();
    await handleLoginSuccess(user?.id);
    setIsVerifyingMfa(false);
  };

  const handleLoginSuccess = async (userId: string | undefined) => {
    toast.success("Welcome back!");
    
    if (userId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed, user_type")
        .eq("user_id", userId)
        .maybeSingle();

      if (profile && !profile.onboarding_completed) {
        navigate(profile.user_type === "owner" ? "/onboarding/owner" : "/onboarding/player");
      } else if (profile?.user_type === "owner") {
        navigate("/owner-dashboard");
      } else {
        navigate("/dashboard");
      }
    } else {
      navigate("/dashboard");
    }
  };

  const handleBackToLogin = () => {
    setMfaRequired(false);
    setMfaFactorId(null);
    setTotpCode("");
    supabase.auth.signOut();
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      toast.error(error.message);
      setIsLoading(false);
    }
  };

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
            Welcome back
          </h1>
          <p className="text-lg text-secondary-foreground/70">
            Sign in to access your bookings, manage your venues, and find your next game.
          </p>
        </div>
        
        <div className="text-sm text-secondary-foreground/50">
          © {new Date().getFullYear()} Sportsbnb
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {mfaRequired ? (
            <>
              <button
                onClick={handleBackToLogin}
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to login
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Two-factor authentication</h2>
                  <p className="text-muted-foreground">Enter the code from your authenticator app</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={totpCode}
                    onChange={setTotpCode}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <Button 
                  onClick={handleMfaVerify} 
                  className="w-full h-12" 
                  size="lg" 
                  disabled={totpCode.length !== 6 || isVerifyingMfa}
                >
                  {isVerifyingMfa ? "Verifying..." : "Verify"}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Open your authenticator app to view your verification code
                </p>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to home
              </Link>

              <h2 className="text-2xl font-bold text-foreground mb-2">Sign in</h2>
              <p className="text-muted-foreground mb-8">
                Don't have an account?{" "}
                <Link to="/signup" className="text-primary hover:underline">
                  Sign up
                </Link>
              </p>

              {/* Google Sign In Button */}
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
                  <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="h-12"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="h-12"
                    required
                  />
                </div>

                <Button type="submit" className="w-full h-12" size="lg" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
