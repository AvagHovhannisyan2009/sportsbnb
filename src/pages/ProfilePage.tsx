import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { User, Bell, CreditCard, Shield, LogOut, Camera, MapPin, Calendar, Upload, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SPORTS_OPTIONS = [
  "Football", "Basketball", "Tennis", "Swimming", 
  "Volleyball", "Badminton", "Rugby", "Gym",
  "Cricket", "Golf", "Running", "Cycling"
];

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, profile, isLoading: authLoading, signOut, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    city: "",
    dateOfBirth: "",
    gender: "",
    preferredSports: [] as string[],
    skillLevel: "",
    // Owner fields
    businessName: "",
    venueName: "",
    venueAddress: "",
    venueDescription: "",
    sportsOffered: [] as string[],
  });

  const [notifications, setNotifications] = useState({
    bookingConfirmations: true,
    gameUpdates: true,
    newGamesNearby: false,
    marketingEmails: false,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.full_name || "",
        username: profile.username || "",
        email: user?.email || "",
        phone: profile.phone || "",
        city: profile.city || "",
        dateOfBirth: profile.date_of_birth || "",
        gender: profile.gender || "",
        preferredSports: profile.preferred_sports || [],
        skillLevel: profile.skill_level || "",
        businessName: profile.business_name || "",
        venueName: profile.venue_name || "",
        venueAddress: profile.venue_address || "",
        venueDescription: profile.venue_description || "",
        sportsOffered: profile.sports_offered || [],
      });
      setAvatarPreview(profile.avatar_url || null);
    }
  }, [profile, user]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSportToggle = (sport: string) => {
    if (profile?.user_type === "owner") {
      setFormData(prev => ({
        ...prev,
        sportsOffered: prev.sportsOffered.includes(sport)
          ? prev.sportsOffered.filter(s => s !== sport)
          : [...prev.sportsOffered, sport]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        preferredSports: prev.preferredSports.includes(sport)
          ? prev.preferredSports.filter(s => s !== sport)
          : [...prev.preferredSports, sport]
      }));
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);

    try {
      let avatarUrl = profile?.avatar_url;

      // Upload new avatar if provided
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const filePath = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile);

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);
          avatarUrl = publicUrl;
        }
      }

      const updateData = profile?.user_type === "owner" ? {
        full_name: formData.fullName,
        phone: formData.phone || null,
        city: formData.city || null,
        business_name: formData.businessName || null,
        venue_name: formData.venueName || null,
        venue_address: formData.venueAddress || null,
        venue_description: formData.venueDescription || null,
        sports_offered: formData.sportsOffered.length > 0 ? formData.sportsOffered : null,
        avatar_url: avatarUrl,
      } : {
        full_name: formData.fullName,
        username: formData.username || null,
        phone: formData.phone || null,
        city: formData.city || null,
        date_of_birth: formData.dateOfBirth || null,
        gender: formData.gender || null,
        preferred_sports: formData.preferredSports.length > 0 ? formData.preferredSports : null,
        skill_level: formData.skillLevel || null,
        avatar_url: avatarUrl,
      };

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', user.id);

      if (error) throw error;

      await refreshProfile();
      setAvatarFile(null);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getUserInitials = () => {
    const name = formData.fullName || formData.username || user?.email || "";
    if (name.includes("@")) {
      return name.charAt(0).toUpperCase();
    }
    return name.split(" ").map((n: string) => n.charAt(0)).join("").toUpperCase().slice(0, 2);
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  const isOwner = profile?.user_type === "owner";

  return (
    <Layout>
      <div className="bg-background min-h-screen">
        <div className="container py-8">
          {/* Profile Header */}
          <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatarPreview || undefined} />
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <Label 
                htmlFor="avatar-upload" 
                className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors"
              >
                <Camera className="h-4 w-4" />
              </Label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-foreground">
                  {formData.fullName || formData.username || "Your Profile"}
                </h1>
                {isOwner && (
                  <Badge variant="secondary">Venue Owner</Badge>
                )}
              </div>
              <p className="text-muted-foreground">{user?.email}</p>
              {formData.city && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <MapPin className="h-3 w-3" />
                  <span>{formData.city}</span>
                </div>
              )}
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
              <TabsTrigger value="profile" className="gap-2">
                <User className="h-4 w-4 hidden sm:block" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="notifications" className="gap-2">
                <Bell className="h-4 w-4 hidden sm:block" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="security" className="gap-2">
                <Shield className="h-4 w-4 hidden sm:block" />
                Security
              </TabsTrigger>
              <TabsTrigger value="billing" className="gap-2">
                <CreditCard className="h-4 w-4 hidden sm:block" />
                Billing
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Update your personal details and public profile.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="John Doe"
                      />
                    </div>
                    {!isOwner && (
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          value={formData.username}
                          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                          placeholder="johndoe"
                        />
                      </div>
                    )}
                    {isOwner && (
                      <div className="space-y-2">
                        <Label htmlFor="businessName">Business Name</Label>
                        <Input
                          id="businessName"
                          value={formData.businessName}
                          onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                          placeholder="My Sports Business"
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground">Contact support to change email</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="New York"
                      />
                    </div>
                    {!isOwner && (
                      <div className="space-y-2">
                        <Label htmlFor="dob">Date of Birth</Label>
                        <Input
                          id="dob"
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                        />
                      </div>
                    )}
                    {isOwner && (
                      <div className="space-y-2">
                        <Label htmlFor="venueName">Venue Name</Label>
                        <Input
                          id="venueName"
                          value={formData.venueName}
                          onChange={(e) => setFormData({ ...formData, venueName: e.target.value })}
                          placeholder="Downtown Sports Complex"
                        />
                      </div>
                    )}
                  </div>

                  {isOwner && (
                    <div className="space-y-2">
                      <Label htmlFor="venueAddress">Venue Address</Label>
                      <Input
                        id="venueAddress"
                        value={formData.venueAddress}
                        onChange={(e) => setFormData({ ...formData, venueAddress: e.target.value })}
                        placeholder="123 Main St"
                      />
                    </div>
                  )}

                  {!isOwner && (
                    <div className="space-y-2">
                      <Label>Gender</Label>
                      <RadioGroup
                        value={formData.gender}
                        onValueChange={(value) => setFormData({ ...formData, gender: value })}
                        className="flex flex-wrap gap-4"
                      >
                        {["male", "female", "other", "prefer not to say"].map((gender) => (
                          <div key={gender} className="flex items-center space-x-2">
                            <RadioGroupItem value={gender} id={`gender-${gender}`} />
                            <Label htmlFor={`gender-${gender}`} className="font-normal cursor-pointer capitalize">
                              {gender}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Sports Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle>{isOwner ? "Sports Offered" : "Sports Preferences"}</CardTitle>
                  <CardDescription>
                    {isOwner 
                      ? "Select the sports available at your venue."
                      : "Select your favorite sports to get personalized recommendations."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {SPORTS_OPTIONS.map((sport) => {
                      const isSelected = isOwner 
                        ? formData.sportsOffered.includes(sport)
                        : formData.preferredSports.includes(sport);
                      return (
                        <div
                          key={sport}
                          onClick={() => handleSportToggle(sport)}
                          className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            isSelected
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <Checkbox checked={isSelected} className="pointer-events-none" />
                          <span className="text-sm font-medium">{sport}</span>
                        </div>
                      );
                    })}
                  </div>

                  {!isOwner && (
                    <div className="space-y-3">
                      <Label>Skill Level</Label>
                      <RadioGroup
                        value={formData.skillLevel}
                        onValueChange={(value) => setFormData({ ...formData, skillLevel: value })}
                        className="grid grid-cols-3 gap-3"
                      >
                        {[
                          { value: "beginner", label: "Beginner" },
                          { value: "intermediate", label: "Intermediate" },
                          { value: "advanced", label: "Advanced" },
                        ].map((level) => (
                          <div key={level.value}>
                            <RadioGroupItem value={level.value} id={`skill-${level.value}`} className="peer sr-only" />
                            <Label
                              htmlFor={`skill-${level.value}`}
                              className="flex items-center justify-center rounded-lg border-2 border-input bg-card p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer"
                            >
                              <span className="font-medium">{level.label}</span>
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  )}

                  <Button onClick={handleSaveProfile} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Choose what notifications you want to receive.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {[
                    { 
                      key: "bookingConfirmations",
                      label: "Booking confirmations", 
                      description: "Get notified when your booking is confirmed"
                    },
                    { 
                      key: "gameUpdates",
                      label: "Game updates", 
                      description: "Receive updates about games you've joined"
                    },
                    { 
                      key: "newGamesNearby",
                      label: "New games nearby", 
                      description: "Get notified when new games are posted in your area"
                    },
                    { 
                      key: "marketingEmails",
                      label: "Marketing emails", 
                      description: "Receive tips, updates, and promotions"
                    },
                  ].map((notification) => (
                    <div key={notification.key} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-foreground">{notification.label}</div>
                        <div className="text-sm text-muted-foreground">{notification.description}</div>
                      </div>
                      <Switch 
                        checked={notifications[notification.key as keyof typeof notifications]}
                        onCheckedChange={(checked) => 
                          setNotifications(prev => ({ ...prev, [notification.key]: checked }))
                        }
                      />
                    </div>
                  ))}
                  <Separator />
                  <Button>Save Preferences</Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Password</CardTitle>
                  <CardDescription>
                    Change your password to keep your account secure.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input id="currentPassword" type="password" placeholder="••••••••" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" type="password" placeholder="••••••••" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input id="confirmPassword" type="password" placeholder="••••••••" />
                  </div>
                  <Button>Update Password</Button>
                </CardContent>
              </Card>

              <Card className="border-destructive/20">
                <CardHeader>
                  <CardTitle className="text-destructive">Danger Zone</CardTitle>
                  <CardDescription>
                    Irreversible and destructive actions.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-foreground">Sign out of all devices</div>
                      <div className="text-sm text-muted-foreground">
                        This will sign you out from all devices except this one.
                      </div>
                    </div>
                    <Button variant="outline">Sign out all</Button>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-foreground">Delete account</div>
                      <div className="text-sm text-muted-foreground">
                        Permanently delete your account and all data.
                      </div>
                    </div>
                    <Button variant="destructive">Delete account</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Billing Tab */}
            <TabsContent value="billing">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>
                    Manage your payment methods for bookings.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg border border-border p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-16 rounded bg-muted flex items-center justify-center text-xs font-medium">
                        VISA
                      </div>
                      <div>
                        <div className="font-medium text-foreground">•••• •••• •••• 4242</div>
                        <div className="text-sm text-muted-foreground">Expires 12/25</div>
                      </div>
                    </div>
                    <Badge variant="secondary">Default</Badge>
                  </div>
                  
                  <Button variant="outline" className="w-full">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Add Payment Method
                  </Button>
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Billing History</CardTitle>
                  <CardDescription>
                    View your past transactions and invoices.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No transactions yet</p>
                    <p className="text-sm">Your billing history will appear here</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Sign Out */}
          <div className="mt-8 pt-6 border-t border-border">
            <Button variant="ghost" onClick={handleSignOut} className="text-destructive hover:text-destructive hover:bg-destructive/10">
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
