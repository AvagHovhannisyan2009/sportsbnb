import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Check, Building } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SPORTS_OPTIONS = [
  "Football", "Basketball", "Tennis", "Swimming", 
  "Volleyball", "Badminton", "Rugby", "Gym",
  "Cricket", "Golf", "Running", "Cycling"
];

const OwnerOnboarding = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: "",
    businessName: "",
    venueName: "",
    city: "",
    venueAddress: "",
    sportsOffered: [] as string[],
    phone: "",
    email: "",
    venueDescription: "",
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
    if (user?.email) {
      setFormData(prev => ({ ...prev, email: user.email || "" }));
    }
  }, [user, authLoading, navigate]);

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const handleSportToggle = (sport: string) => {
    setFormData(prev => ({
      ...prev,
      sportsOffered: prev.sportsOffered.includes(sport)
        ? prev.sportsOffered.filter(s => s !== sport)
        : [...prev.sportsOffered, sport]
    }));
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.fullName.trim() || !formData.businessName.trim()) {
        toast.error("Please fill in required fields");
        return;
      }
    }
    if (currentStep === 2) {
      if (!formData.venueName.trim() || !formData.city.trim()) {
        toast.error("Please fill in required fields");
        return;
      }
    }
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    setIsSubmitting(true);

    try {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName,
          business_name: formData.businessName,
          venue_name: formData.venueName,
          city: formData.city,
          venue_address: formData.venueAddress,
          sports_offered: formData.sportsOffered.length > 0 ? formData.sportsOffered : null,
          phone: formData.phone || null,
          email: formData.email,
          venue_description: formData.venueDescription || null,
          onboarding_completed: true,
        })
        .eq('user_id', user.id);

      if (profileError) {
        throw profileError;
      }

      // Create venue in venues table
      const { error: venueError } = await supabase
        .from('venues')
        .insert({
          owner_id: user.id,
          name: formData.venueName,
          description: formData.venueDescription || null,
          address: formData.venueAddress || null,
          city: formData.city,
          sports: formData.sportsOffered,
          price_per_hour: 30, // Default price
          is_active: true,
        });

      if (venueError) {
        throw venueError;
      }

      toast.success("Venue profile completed and venue listed!");
      navigate("/owner-dashboard");
    } catch (error) {
      console.error("Onboarding error:", error);
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <span className="text-lg font-bold text-primary-foreground">S</span>
            </div>
            <span className="text-xl font-semibold text-foreground">Sportsbnb</span>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="container max-w-2xl py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>Step {currentStep} of {totalSteps}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step 1: Business Info */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Building className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Welcome, Venue Owner!</h1>
              <p className="text-muted-foreground">Let's get your venue listed on Sportsbnb</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Your Full Name *</Label>
                <Input
                  id="fullName"
                  placeholder="John Smith"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name *</Label>
                <Input
                  id="businessName"
                  placeholder="Your company or organization name"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  className="h-12"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Venue Details */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">Tell us about your venue</h1>
              <p className="text-muted-foreground">This information will be shown to players</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="venueName">Venue Name *</Label>
                <Input
                  id="venueName"
                  placeholder="e.g., Downtown Sports Complex"
                  value={formData.venueName}
                  onChange={(e) => setFormData({ ...formData, venueName: e.target.value })}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  placeholder="e.g., New York"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="venueAddress">Full Address</Label>
                <Input
                  id="venueAddress"
                  placeholder="Street address"
                  value={formData.venueAddress}
                  onChange={(e) => setFormData({ ...formData, venueAddress: e.target.value })}
                  className="h-12"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Sports & Description */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">What sports do you offer?</h1>
              <p className="text-muted-foreground">Select all that apply to your venue</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {SPORTS_OPTIONS.map((sport) => (
                <div
                  key={sport}
                  onClick={() => handleSportToggle(sport)}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    formData.sportsOffered.includes(sport)
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <Checkbox
                    checked={formData.sportsOffered.includes(sport)}
                    className="pointer-events-none"
                  />
                  <span className="font-medium">{sport}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-4">
              <Label htmlFor="description">Venue Description</Label>
              <Textarea
                id="description"
                placeholder="Tell players about your venue - facilities, equipment, special features..."
                value={formData.venueDescription}
                onChange={(e) => setFormData({ ...formData, venueDescription: e.target.value })}
                className="min-h-32"
              />
            </div>
          </div>
        )}

        {/* Step 4: Contact Info & Review */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">Contact Information</h1>
              <p className="text-muted-foreground">How can players reach you?</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="contact@venue.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="h-12"
                />
              </div>
            </div>

            <div className="bg-muted/50 rounded-xl p-6 mt-8">
              <h3 className="font-semibold text-foreground mb-4">Venue Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Business Name</span>
                  <span className="font-medium">{formData.businessName || "Not set"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Venue Name</span>
                  <span className="font-medium">{formData.venueName || "Not set"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location</span>
                  <span className="font-medium">{formData.city || "Not set"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sports</span>
                  <span className="font-medium">
                    {formData.sportsOffered.length > 0 
                      ? formData.sportsOffered.slice(0, 3).join(", ") + (formData.sportsOffered.length > 3 ? "..." : "")
                      : "Not set"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          {currentStep < totalSteps ? (
            <Button onClick={handleNext} className="gap-2">
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-2">
              {isSubmitting ? "Saving..." : "Complete Setup"}
              <Check className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OwnerOnboarding;
