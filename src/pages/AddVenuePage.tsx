import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, X, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/hooks/useAuth";
import { useStripeConnect } from "@/hooks/useStripeConnect";
import { StripeConnectBanner } from "@/components/stripe/StripeConnectBanner";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const SPORTS_OPTIONS = [
  "Football", "Basketball", "Tennis", "Swimming", 
  "Volleyball", "Badminton", "Rugby", "Gym",
  "Cricket", "Golf", "Running", "Cycling"
];

const AMENITY_OPTIONS = [
  "Parking", "Showers", "Lockers", "Equipment Rental",
  "Cafe", "Pro Shop", "Coaching", "First Aid",
  "Water Fountains", "Bleachers", "Scoreboard", "Floodlights"
];

const MIN_DESCRIPTION_LENGTH = 100;
const MIN_PHOTOS = 3;

const AddVenuePage = () => {
  const navigate = useNavigate();
  const { user, profile, isLoading: authLoading } = useAuth();
  const { canListVenues, isCheckingStatus } = useStripeConnect();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    city: "",
    sports: [] as string[],
    amenities: [] as string[],
    pricePerHour: "30",
    isIndoor: true,
    isActive: true,
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
    if (!authLoading && user && profile?.user_type !== "owner") {
      navigate("/dashboard");
    }
  }, [user, profile, authLoading, navigate]);

  const handleSportToggle = (sport: string) => {
    setFormData(prev => ({
      ...prev,
      sports: prev.sports.includes(sport)
        ? prev.sports.filter(s => s !== sport)
        : [...prev.sports, sport]
    }));
    setValidationErrors(prev => ({ ...prev, sports: '' }));
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles: File[] = [];
    const validPreviews: string[] = [];

    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max 5MB per image.`);
        return;
      }
      if (imageFiles.length + validFiles.length >= 10) {
        toast.error("Maximum 10 images allowed");
        return;
      }
      validFiles.push(file);
    });

    if (validFiles.length === 0) return;

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        validPreviews.push(reader.result as string);
        if (validPreviews.length === validFiles.length) {
          setImageFiles(prev => [...prev, ...validFiles]);
          setImagePreviews(prev => [...prev, ...validPreviews]);
          setValidationErrors(prev => ({ ...prev, images: '' }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (): Promise<string[]> => {
    if (imageFiles.length === 0 || !user) return [];

    setUploadingImages(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of imageFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('venue-images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('venue-images')
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      }

      return uploadedUrls;
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error("Failed to upload images");
      return [];
    } finally {
      setUploadingImages(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = "Venue name is required";
    }

    if (!formData.city.trim()) {
      errors.city = "City is required";
    }

    if (!formData.address.trim()) {
      errors.address = "Address is required for venue listings";
    }

    if (formData.description.trim().length < MIN_DESCRIPTION_LENGTH) {
      errors.description = `Description must be at least ${MIN_DESCRIPTION_LENGTH} characters. Currently: ${formData.description.trim().length} characters.`;
    }

    if (formData.sports.length === 0) {
      errors.sports = "Please select at least one sport";
    }

    if (imageFiles.length < MIN_PHOTOS) {
      errors.images = `Please upload at least ${MIN_PHOTOS} photos. Currently: ${imageFiles.length} photo(s).`;
    }

    if (!canListVenues) {
      errors.stripe = "You must link your bank account before listing a venue";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    if (!validateForm()) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    setIsSubmitting(true);

    try {
      const imageUrls = await uploadImages();
      if (imageUrls.length < MIN_PHOTOS) {
        toast.error("Failed to upload required images. Please try again.");
        setIsSubmitting(false);
        return;
      }

      const { error } = await supabase
        .from('venues')
        .insert({
          owner_id: user.id,
          name: formData.name.trim(),
          description: formData.description.trim(),
          address: formData.address.trim(),
          city: formData.city.trim(),
          sports: formData.sports,
          amenities: formData.amenities,
          price_per_hour: parseFloat(formData.pricePerHour) || 30,
          is_indoor: formData.isIndoor,
          is_active: formData.isActive,
          image_url: imageUrls[0], // Primary image
        });

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["owner-venues"] });
      queryClient.invalidateQueries({ queryKey: ["venues"] });
      
      toast.success("Venue added successfully!");
      navigate("/owner-dashboard");
    } catch (error) {
      console.error("Error adding venue:", error);
      toast.error("Failed to add venue. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || isCheckingStatus) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-background min-h-screen">
        <div className="container py-8 max-w-3xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Add New Venue</h1>
              <p className="text-muted-foreground">Create a quality venue listing</p>
            </div>
          </div>

          {/* Stripe Connect Banner */}
          <div className="mb-6">
            <StripeConnectBanner />
          </div>

          {!canListVenues ? (
            <Card className="p-8 text-center">
              <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Bank Account Required</h2>
              <p className="text-muted-foreground mb-4">
                You must link your bank account before you can list venues. 
                This ensures you can receive payouts when players book your venue.
              </p>
            </Card>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Requirements Notice */}
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Quality Requirements:</strong> All venues must have a detailed description (100+ characters) and at least 3 photos to ensure players can make informed booking decisions.
                </AlertDescription>
              </Alert>

              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Provide accurate details to attract more bookings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Venue Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Downtown Sports Complex"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        setValidationErrors(prev => ({ ...prev, name: '' }));
                      }}
                      maxLength={100}
                      className={validationErrors.name ? 'border-destructive' : ''}
                    />
                    {validationErrors.name && (
                      <p className="text-sm text-destructive">{validationErrors.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">
                      Description * <span className="text-muted-foreground text-xs">({formData.description.length}/{MIN_DESCRIPTION_LENGTH} min characters)</span>
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your venue in detail - include facilities, equipment available, special features, parking information, nearby amenities, and what makes your venue special for players..."
                      value={formData.description}
                      onChange={(e) => {
                        setFormData({ ...formData, description: e.target.value });
                        setValidationErrors(prev => ({ ...prev, description: '' }));
                      }}
                      className={`min-h-32 ${validationErrors.description ? 'border-destructive' : ''}`}
                      maxLength={1000}
                    />
                    {validationErrors.description && (
                      <p className="text-sm text-destructive">{validationErrors.description}</p>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        placeholder="e.g., New York"
                        value={formData.city}
                        onChange={(e) => {
                          setFormData({ ...formData, city: e.target.value });
                          setValidationErrors(prev => ({ ...prev, city: '' }));
                        }}
                        maxLength={100}
                        className={validationErrors.city ? 'border-destructive' : ''}
                      />
                      {validationErrors.city && (
                        <p className="text-sm text-destructive">{validationErrors.city}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address *</Label>
                      <Input
                        id="address"
                        placeholder="Full street address"
                        value={formData.address}
                        onChange={(e) => {
                          setFormData({ ...formData, address: e.target.value });
                          setValidationErrors(prev => ({ ...prev, address: '' }));
                        }}
                        maxLength={200}
                        className={validationErrors.address ? 'border-destructive' : ''}
                      />
                      {validationErrors.address && (
                        <p className="text-sm text-destructive">{validationErrors.address}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Image Upload - Multiple */}
              <Card className={validationErrors.images ? 'border-destructive' : ''}>
                <CardHeader>
                  <CardTitle>
                    Venue Photos * <span className="text-muted-foreground text-sm font-normal">({imageFiles.length}/{MIN_PHOTOS} minimum)</span>
                  </CardTitle>
                  <CardDescription>Upload at least 3 high-quality photos showing different areas of your venue</CardDescription>
                </CardHeader>
                <CardContent>
                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative aspect-video">
                          <img
                            src={preview}
                            alt={`Venue preview ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-7 w-7"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          {index === 0 && (
                            <span className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                              Primary
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {imageFiles.length < 10 && (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">Click to upload venue photos</span>
                      <span className="text-xs text-muted-foreground mt-1">Max 5MB per image, up to 10 photos</span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                      />
                    </label>
                  )}
                  
                  {validationErrors.images && (
                    <p className="text-sm text-destructive mt-2">{validationErrors.images}</p>
                  )}
                </CardContent>
              </Card>

              {/* Sports */}
              <Card className={validationErrors.sports ? 'border-destructive' : ''}>
                <CardHeader>
                  <CardTitle>Sports Offered *</CardTitle>
                  <CardDescription>Select all sports available at your venue</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {SPORTS_OPTIONS.map((sport) => (
                      <div
                        key={sport}
                        onClick={() => handleSportToggle(sport)}
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          formData.sports.includes(sport)
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <Checkbox
                          checked={formData.sports.includes(sport)}
                          className="pointer-events-none"
                        />
                        <span className="text-sm font-medium">{sport}</span>
                      </div>
                    ))}
                  </div>
                  {validationErrors.sports && (
                    <p className="text-sm text-destructive mt-2">{validationErrors.sports}</p>
                  )}
                </CardContent>
              </Card>

              {/* Amenities */}
              <Card>
                <CardHeader>
                  <CardTitle>Amenities</CardTitle>
                  <CardDescription>Highlight what makes your venue special</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {AMENITY_OPTIONS.map((amenity) => (
                      <div
                        key={amenity}
                        onClick={() => handleAmenityToggle(amenity)}
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          formData.amenities.includes(amenity)
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <Checkbox
                          checked={formData.amenities.includes(amenity)}
                          className="pointer-events-none"
                        />
                        <span className="text-sm font-medium">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Pricing & Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Pricing & Settings</CardTitle>
                  <CardDescription>You'll receive 90% of each booking</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price per Hour ($) *</Label>
                    <Input
                      id="price"
                      type="number"
                      min="1"
                      max="1000"
                      placeholder="30"
                      value={formData.pricePerHour}
                      onChange={(e) => setFormData({ ...formData, pricePerHour: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Your earnings: ${((parseFloat(formData.pricePerHour) || 30) * 0.9).toFixed(2)}/hour after platform fee
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Indoor Venue</Label>
                      <p className="text-sm text-muted-foreground">Is this an indoor facility?</p>
                    </div>
                    <Switch
                      checked={formData.isIndoor}
                      onCheckedChange={(checked) => setFormData({ ...formData, isIndoor: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Active Listing</Label>
                      <p className="text-sm text-muted-foreground">Make this venue visible to players</p>
                    </div>
                    <Switch
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Submit */}
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || uploadingImages}
                  className="flex-1"
                >
                  {isSubmitting || uploadingImages ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {uploadingImages ? "Uploading photos..." : "Saving..."}
                    </>
                  ) : (
                    "Add Venue"
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AddVenuePage;
