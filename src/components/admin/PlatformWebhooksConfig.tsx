import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Webhook, CheckCircle2, XCircle, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface WebhookSetting {
  key: string;
  label: string;
  description: string;
  value: string;
}

const WEBHOOK_SETTINGS: Omit<WebhookSetting, "value">[] = [
  {
    key: "make_webhook_bookings",
    label: "New Bookings",
    description: "Triggered when a new booking is confirmed",
  },
  {
    key: "make_webhook_cancellations",
    label: "Booking Cancellations",
    description: "Triggered when a booking is cancelled",
  },
  {
    key: "make_webhook_signups",
    label: "New User Signups",
    description: "Triggered when a new user registers",
  },
  {
    key: "make_webhook_venues",
    label: "New Venue Listings",
    description: "Triggered when a new venue is added",
  },
];

export function PlatformWebhooksConfig() {
  const [settings, setSettings] = useState<WebhookSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [testingKey, setTestingKey] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, "success" | "error">>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("platform_settings")
        .select("setting_key, setting_value")
        .in("setting_key", WEBHOOK_SETTINGS.map((s) => s.key));

      if (error) throw error;

      const settingsMap = new Map(data?.map((d) => [d.setting_key, d.setting_value]) || []);
      
      setSettings(
        WEBHOOK_SETTINGS.map((s) => ({
          ...s,
          value: settingsMap.get(s.key) || "",
        }))
      );
    } catch (error) {
      console.error("Error fetching webhook settings:", error);
      toast.error("Failed to load webhook settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleValueChange = (key: string, value: string) => {
    setSettings((prev) =>
      prev.map((s) => (s.key === key ? { ...s, value } : s))
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      for (const setting of settings) {
        const { error } = await supabase
          .from("platform_settings")
          .update({ setting_value: setting.value || null })
          .eq("setting_key", setting.key);

        if (error) throw error;
      }

      toast.success("Webhook settings saved!");
    } catch (error) {
      console.error("Error saving webhook settings:", error);
      toast.error("Failed to save webhook settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async (setting: WebhookSetting) => {
    if (!setting.value) {
      toast.error("Please enter a webhook URL first");
      return;
    }

    setTestingKey(setting.key);
    setTestResults((prev) => ({ ...prev, [setting.key]: undefined as any }));

    try {
      const response = await fetch(setting.value, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_type: "test",
          timestamp: new Date().toISOString(),
          data: {
            test: true,
            message: "This is a test webhook from SportsBnB Admin",
            webhook_type: setting.key,
          },
        }),
      });

      if (response.ok) {
        setTestResults((prev) => ({ ...prev, [setting.key]: "success" }));
        toast.success("Test webhook sent successfully!");
      } else {
        setTestResults((prev) => ({ ...prev, [setting.key]: "error" }));
        toast.error("Webhook test failed - check your URL");
      }
    } catch (error) {
      console.error("Webhook test error:", error);
      setTestResults((prev) => ({ ...prev, [setting.key]: "error" }));
      toast.error("Failed to send test webhook");
    } finally {
      setTestingKey(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/10">
            <Webhook className="h-5 w-5 text-purple-500" />
          </div>
          <div>
            <CardTitle className="flex items-center gap-2">
              Platform Webhooks
              <Badge variant="secondary">Make.com</Badge>
            </CardTitle>
            <CardDescription>
              Configure global webhooks for platform-wide events. These will trigger for all venues.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {settings.map((setting) => (
          <div key={setting.key} className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor={setting.key}>{setting.label}</Label>
                <p className="text-sm text-muted-foreground">{setting.description}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Input
                id={setting.key}
                type="url"
                placeholder="https://hook.eu1.make.com/..."
                value={setting.value}
                onChange={(e) => handleValueChange(setting.key, e.target.value)}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleTest(setting)}
                disabled={testingKey === setting.key || !setting.value}
              >
                {testingKey === setting.key ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : testResults[setting.key] === "success" ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : testResults[setting.key] === "error" ? (
                  <XCircle className="h-4 w-4 text-destructive" />
                ) : (
                  "Test"
                )}
              </Button>
            </div>
          </div>
        ))}

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save All Webhooks
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
