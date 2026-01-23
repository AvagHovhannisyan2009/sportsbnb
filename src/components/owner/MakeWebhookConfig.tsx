import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Webhook, ExternalLink, CheckCircle2, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MakeWebhookConfigProps {
  venueId: string;
  initialWebhookUrl?: string | null;
  initialEvents?: string[] | null;
  onSave?: () => void;
}

const AVAILABLE_EVENTS = [
  { id: "booking_created", label: "New Bookings", description: "When a new booking is confirmed" },
  { id: "booking_cancelled", label: "Booking Cancellations", description: "When a booking is cancelled" },
];

export function MakeWebhookConfig({ 
  venueId, 
  initialWebhookUrl, 
  initialEvents,
  onSave 
}: MakeWebhookConfigProps) {
  const { t } = useTranslation();
  const [webhookUrl, setWebhookUrl] = useState(initialWebhookUrl || "");
  const [selectedEvents, setSelectedEvents] = useState<string[]>(
    initialEvents || ["booking_created", "booking_cancelled"]
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null);

  const handleEventToggle = (eventId: string) => {
    setSelectedEvents((prev) =>
      prev.includes(eventId)
        ? prev.filter((e) => e !== eventId)
        : [...prev, eventId]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("venues")
        .update({
          make_webhook_url: webhookUrl || null,
          make_webhook_events: selectedEvents,
        })
        .eq("id", venueId);

      if (error) throw error;

      toast.success("Make.com webhook settings saved!");
      onSave?.();
    } catch (error) {
      console.error("Error saving webhook settings:", error);
      toast.error("Failed to save webhook settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    if (!webhookUrl) {
      toast.error("Please enter a webhook URL first");
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("webhook-dispatcher", {
        body: {
          event_type: "test",
          venue_id: venueId,
          data: {
            test: true,
            message: "This is a test webhook from SportsBnB",
            venue_id: venueId,
            timestamp: new Date().toISOString(),
          },
        },
      });

      // Since we're testing directly, also send to the URL
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_type: "test",
          timestamp: new Date().toISOString(),
          data: {
            test: true,
            message: "This is a test webhook from SportsBnB",
            venue_id: venueId,
          },
        }),
      });

      if (response.ok) {
        setTestResult("success");
        toast.success("Test webhook sent successfully!");
      } else {
        setTestResult("error");
        toast.error("Webhook test failed - check your URL");
      }
    } catch (error) {
      console.error("Webhook test error:", error);
      setTestResult("error");
      toast.error("Failed to send test webhook");
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/10">
            <Webhook className="h-5 w-5 text-purple-500" />
          </div>
          <div>
            <CardTitle className="flex items-center gap-2">
              Make.com Integration
              <Badge variant="secondary">Automation</Badge>
            </CardTitle>
            <CardDescription>
              Connect your venue to Make.com to automate workflows when bookings are made or cancelled
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="webhook-url">Webhook URL</Label>
          <div className="flex gap-2">
            <Input
              id="webhook-url"
              type="url"
              placeholder="https://hook.eu1.make.com/..."
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="flex-1"
            />
            <Button
              variant="outline"
              onClick={handleTest}
              disabled={isTesting || !webhookUrl}
            >
              {isTesting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : testResult === "success" ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : testResult === "error" ? (
                <XCircle className="h-4 w-4 text-destructive" />
              ) : (
                "Test"
              )}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Create a webhook in Make.com and paste the URL here.{" "}
            <a
              href="https://www.make.com/en/help/tools/webhooks"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-1"
            >
              Learn how <ExternalLink className="h-3 w-3" />
            </a>
          </p>
        </div>

        <div className="space-y-3">
          <Label>Trigger Events</Label>
          <div className="space-y-3">
            {AVAILABLE_EVENTS.map((event) => (
              <div key={event.id} className="flex items-start space-x-3">
                <Checkbox
                  id={event.id}
                  checked={selectedEvents.includes(event.id)}
                  onCheckedChange={() => handleEventToggle(event.id)}
                />
                <div className="grid gap-0.5 leading-none">
                  <Label htmlFor={event.id} className="cursor-pointer">
                    {event.label}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {event.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Webhook Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
