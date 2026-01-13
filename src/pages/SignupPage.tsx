import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, User, Building } from "lucide-react";

const SignupPage = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<"player" | "owner">("player");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate signup
    if (userType === "player") {
      navigate("/dashboard");
    } else {
      navigate("/owner-dashboard");
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

          <form onSubmit={handleSubmit} className="space-y-6">
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
                type="text"
                placeholder={userType === "player" ? "John Doe" : "My Sports Center"}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-12"
                required
              />
            </div>

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
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="h-12"
                required
              />
            </div>

            <Button type="submit" className="w-full h-12" size="lg">
              Create account
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
