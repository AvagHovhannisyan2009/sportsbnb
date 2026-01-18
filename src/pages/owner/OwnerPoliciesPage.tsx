import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, FileText, Save, Clock, Ban, Info, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OwnerLayout } from "@/components/owner/OwnerLayout";
import { EmptyState } from "@/components/owner/EmptyState";
import { useAuth } from "@/hooks/useAuth";
import { useOwnerVenues } from "@/hooks/useVenues";
import { useVenuePolicy, useSaveVenuePolicy } from "@/hooks/useVenuePolicies";
import { toast } from "sonner";

const OwnerPoliciesPage = () => {
  const navigate = useNavigate();
  const { user, profile, isLoading: authLoading } = useAuth();
  const { data: myVenues = [], isLoading: venuesLoading } = useOwnerVenues(user?.id);

  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Policy form state
  const [cancellationPolicy, setCancellationPolicy] = useState("flexible");
  const [customCancellationHours, setCustomCancellationHours] = useState(24);
  const [refundType, setRefundType] = useState("full");
  const [minDuration, setMinDuration] = useState(1);
  const [maxDuration, setMaxDuration] = useState(8);
  const [timeSlotIncrement, setTimeSlotIncrement] = useState(60);
  const [bookingWindowDays, setBookingWindowDays] = useState(30);
  const [bufferMinutes, setBufferMinutes] = useState(0);
  const [gracePeriodMinutes, setGracePeriodMinutes] = useState(15);
  const [venueRules, setVenueRules] = useState("");
  const [checkinInstructions, setCheckinInstructions] = useState("");

  // Set default venue
  useEffect(() => {
    if (myVenues.length > 0 && !selectedVenueId) {
      setSelectedVenueId(myVenues[0].id);
    }
  }, [myVenues, selectedVenueId]);

  const { data: existingPolicy, isLoading: policyLoading } = useVenuePolicy(selectedVenueId || undefined);
  const savePolicy = useSaveVenuePolicy();

  // Load existing policy
  useEffect(() => {
    if (existingPolicy) {
      setCancellationPolicy(existingPolicy.cancellation_policy);
      setCustomCancellationHours(existingPolicy.cancellation_hours);
      setRefundType(existingPolicy.refund_type);
      setMinDuration(existingPolicy.min_duration_hours);
      setMaxDuration(existingPolicy.max_duration_hours);
      setTimeSlotIncrement(existingPolicy.time_slot_increment);
      setBookingWindowDays(existingPolicy.booking_window_days);
      setBufferMinutes(existingPolicy.buffer_minutes);
      setGracePeriodMinutes(existingPolicy.grace_period_minutes);
      setVenueRules(existingPolicy.venue_rules || "");
      setCheckinInstructions(existingPolicy.checkin_instructions || "");
    } else {
      // Reset to defaults
      setCancellationPolicy("flexible");
      setCustomCancellationHours(24);
      setRefundType("full");
      setMinDuration(1);
      setMaxDuration(8);
      setTimeSlotIncrement(60);
      setBookingWindowDays(30);
      setBufferMinutes(0);
      setGracePeriodMinutes(15);
      setVenueRules("");
      setCheckinInstructions("");
    }
  }, [existingPolicy, selectedVenueId]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
    if (!authLoading && user && profile?.user_type !== "owner") {
      navigate("/dashboard");
    }
  }, [user, profile, authLoading, navigate]);

  if (authLoading || venuesLoading) {
    return (
      <OwnerLayout title="Policies">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </OwnerLayout>
    );
  }

  const getCancellationHours = () => {
    switch (cancellationPolicy) {
      case "flexible": return 24;
      case "moderate": return 48;
      case "strict": return 72;
      case "custom": return customCancellationHours;
      default: return 24;
    }
  };

  const handleSave = async () => {
    if (!selectedVenueId) return;
    setIsSaving(true);

    try {
      await savePolicy.mutateAsync({
        venueId: selectedVenueId,
        policy: {
          cancellation_policy: cancellationPolicy,
          cancellation_hours: getCancellationHours(),
          refund_type: refundType,
          min_duration_hours: minDuration,
          max_duration_hours: maxDuration,
          time_slot_increment: timeSlotIncrement,
          booking_window_days: bookingWindowDays,
          buffer_minutes: bufferMinutes,
          grace_period_minutes: gracePeriodMinutes,
          venue_rules: venueRules || null,
          checkin_instructions: checkinInstructions || null,
        },
      });
      toast.success("Policies saved successfully!");
    } catch (error) {
      toast.error("Failed to save policies");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <OwnerLayout title="Policies" subtitle="Set cancellation rules, booking policies, and venue instructions">
      {myVenues.length === 0 ? (
        <Card>
          <EmptyState
            icon={FileText}
            title="No venues to configure"
            description="Add a venue first to set up policies and rules."
            actionLabel="Add Your First Venue"
            actionHref="/add-venue"
          />
        </Card>
      ) : (
        <div className="max-w-3xl space-y-6">
          {/* Venue Selector */}
          <div>
            <Label className="mb-2 block">Select Venue</Label>
            <Select value={selectedVenueId || ""} onValueChange={setSelectedVenueId}>
              <SelectTrigger className="w-full max-w-xs">
                <SelectValue placeholder="Select a venue" />
              </SelectTrigger>
              <SelectContent>
                {myVenues.map((venue) => (
                  <SelectItem key={venue.id} value={venue.id}>
                    {venue.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {policyLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Cancellation Policy */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Ban className="h-5 w-5 text-primary" />
                    Cancellation Policy
                  </CardTitle>
                  <CardDescription>
                    Define how far in advance customers must cancel to receive a refund
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <RadioGroup value={cancellationPolicy} onValueChange={setCancellationPolicy}>
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/50 hover:bg-muted/70 transition-colors cursor-pointer">
                      <RadioGroupItem value="flexible" id="flexible" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="flexible" className="font-medium cursor-pointer">Flexible</Label>
                        <p className="text-sm text-muted-foreground">Cancel up to 24 hours before for a full refund</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/50 hover:bg-muted/70 transition-colors cursor-pointer">
                      <RadioGroupItem value="moderate" id="moderate" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="moderate" className="font-medium cursor-pointer">Moderate</Label>
                        <p className="text-sm text-muted-foreground">Cancel up to 48 hours before for a full refund</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/50 hover:bg-muted/70 transition-colors cursor-pointer">
                      <RadioGroupItem value="strict" id="strict" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="strict" className="font-medium cursor-pointer">Strict</Label>
                        <p className="text-sm text-muted-foreground">Cancel up to 72 hours before for a full refund</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/50 hover:bg-muted/70 transition-colors cursor-pointer">
                      <RadioGroupItem value="custom" id="custom" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="custom" className="font-medium cursor-pointer">Custom</Label>
                        <p className="text-sm text-muted-foreground mb-2">Set your own cancellation window</p>
                        {cancellationPolicy === "custom" && (
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={customCancellationHours}
                              onChange={(e) => setCustomCancellationHours(parseInt(e.target.value) || 24)}
                              className="w-24"
                              min={1}
                            />
                            <span className="text-sm text-muted-foreground">hours before booking</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </RadioGroup>

                  <Separator />

                  <div className="space-y-3">
                    <Label>Refund Type</Label>
                    <RadioGroup value={refundType} onValueChange={setRefundType} className="flex gap-4">
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="full" id="full-refund" />
                        <Label htmlFor="full-refund" className="cursor-pointer">Full refund</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="partial" id="partial-refund" />
                        <Label htmlFor="partial-refund" className="cursor-pointer">50% refund</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="none" id="no-refund" />
                        <Label htmlFor="no-refund" className="cursor-pointer">No refund</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>

              {/* Booking Rules */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Booking Rules
                  </CardTitle>
                  <CardDescription>
                    Control how customers can book your venue
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Minimum Duration</Label>
                      <Select value={minDuration.toString()} onValueChange={(v) => setMinDuration(parseFloat(v))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0.5">30 minutes</SelectItem>
                          <SelectItem value="1">1 hour</SelectItem>
                          <SelectItem value="1.5">1.5 hours</SelectItem>
                          <SelectItem value="2">2 hours</SelectItem>
                          <SelectItem value="3">3 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Maximum Duration</Label>
                      <Select value={maxDuration.toString()} onValueChange={(v) => setMaxDuration(parseFloat(v))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2">2 hours</SelectItem>
                          <SelectItem value="4">4 hours</SelectItem>
                          <SelectItem value="6">6 hours</SelectItem>
                          <SelectItem value="8">8 hours</SelectItem>
                          <SelectItem value="12">12 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Time Slot Increments</Label>
                      <Select value={timeSlotIncrement.toString()} onValueChange={(v) => setTimeSlotIncrement(parseInt(v))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="60">60 minutes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Booking Window</Label>
                      <Select value={bookingWindowDays.toString()} onValueChange={(v) => setBookingWindowDays(parseInt(v))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7">Up to 7 days ahead</SelectItem>
                          <SelectItem value="14">Up to 14 days ahead</SelectItem>
                          <SelectItem value="30">Up to 30 days ahead</SelectItem>
                          <SelectItem value="60">Up to 60 days ahead</SelectItem>
                          <SelectItem value="90">Up to 90 days ahead</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Buffer Between Bookings</Label>
                      <Select value={bufferMinutes.toString()} onValueChange={(v) => setBufferMinutes(parseInt(v))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">No buffer</SelectItem>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="60">60 minutes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Late Arrival Grace Period</Label>
                      <Select value={gracePeriodMinutes.toString()} onValueChange={(v) => setGracePeriodMinutes(parseInt(v))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">No grace period</SelectItem>
                          <SelectItem value="10">10 minutes</SelectItem>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Venue Rules & Instructions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-primary" />
                    Rules & Instructions
                  </CardTitle>
                  <CardDescription>
                    Information displayed to customers before and after booking
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Venue Rules</Label>
                    <Textarea
                      placeholder="e.g., No outside food or drinks, proper sports attire required, no smoking on premises..."
                      value={venueRules}
                      onChange={(e) => setVenueRules(e.target.value)}
                      rows={4}
                    />
                    <p className="text-xs text-muted-foreground">
                      Displayed on the venue page before booking
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Check-in Instructions</Label>
                    <Textarea
                      placeholder="e.g., Enter through the main gate, check in at the front desk, locker rooms are on the left..."
                      value={checkinInstructions}
                      onChange={(e) => setCheckinInstructions(e.target.value)}
                      rows={4}
                    />
                    <p className="text-xs text-muted-foreground">
                      Sent to customers after booking confirmation
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Save Button */}
              <Button onClick={handleSave} disabled={isSaving} size="lg" className="w-full">
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Policies
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      )}
    </OwnerLayout>
  );
};

export default OwnerPoliciesPage;
