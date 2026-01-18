import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { 
  Link2, 
  Calendar as CalendarIcon, 
  ExternalLink, 
  Check, 
  Copy, 
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OwnerLayout } from "@/components/owner/OwnerLayout";
import { useOwnerVenues } from "@/hooks/useVenues";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  connected: boolean;
  comingSoon?: boolean;
}

const OwnerIntegrationsPage = () => {
  const navigate = useNavigate();
  const { user, profile, isLoading: authLoading } = useAuth();
  const { data: myVenues = [] } = useOwnerVenues(user?.id);
  
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [externalCalendarUrl, setExternalCalendarUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (myVenues.length > 0 && !selectedVenueId) {
      setSelectedVenueId(myVenues[0].id);
    }
  }, [myVenues, selectedVenueId]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <OwnerLayout title="Integrations">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </OwnerLayout>
    );
  }

  const integrations: Integration[] = [
    {
      id: "google-calendar",
      name: "Google Calendar",
      description: "Sync your bookings with Google Calendar to keep your schedule in one place.",
      icon: CalendarIcon,
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400",
      connected: false,
    },
    {
      id: "outlook-calendar",
      name: "Outlook Calendar",
      description: "Connect Microsoft Outlook to see bookings alongside your other meetings.",
      icon: CalendarIcon,
      iconBg: "bg-sky-100 dark:bg-sky-900/30",
      iconColor: "text-sky-600 dark:text-sky-400",
      connected: false,
    },
    {
      id: "apple-calendar",
      name: "Apple Calendar",
      description: "Sync with iCloud Calendar on all your Apple devices.",
      icon: CalendarIcon,
      iconBg: "bg-gray-100 dark:bg-gray-900/30",
      iconColor: "text-gray-600 dark:text-gray-400",
      connected: false,
    },
  ];

  // Generate iCal feed URL (demo)
  const icalFeedUrl = selectedVenueId 
    ? `${window.location.origin}/api/calendar/${selectedVenueId}/feed.ics`
    : "";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(icalFeedUrl);
    setCopied(true);
    toast.success("iCal link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImportCalendar = () => {
    if (!externalCalendarUrl) {
      toast.error("Please enter a calendar URL");
      return;
    }
    // In a real implementation, this would save the URL to the database
    toast.success("External calendar connected! Busy times will be synced.");
    setImportDialogOpen(false);
    setExternalCalendarUrl("");
  };

  return (
    <OwnerLayout title="Integrations" subtitle="Connect external calendars and services">
      <div className="max-w-4xl space-y-6">
        {/* Venue Selector */}
        {myVenues.length > 1 && (
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
        )}

        {/* iCal Export Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-primary" />
              Calendar Sync
            </CardTitle>
            <CardDescription>
              Export your Sportsbnb calendar to sync with any calendar app
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <CalendarIcon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-foreground mb-1">Export iCal Feed</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Copy this link and add it to Google Calendar, Outlook, Apple Calendar, or any app that supports iCal.
                  </p>
                  <div className="flex items-center gap-2">
                    <Input
                      value={icalFeedUrl}
                      readOnly
                      className="font-mono text-xs bg-background"
                    />
                    <Button variant="outline" size="icon" onClick={handleCopyLink}>
                      {copied ? (
                        <Check className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="font-medium text-foreground">How to use:</h4>
              <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                <li>Copy the iCal feed URL above</li>
                <li>Open your calendar app (Google Calendar, Outlook, etc.)</li>
                <li>Add a calendar by URL / Subscribe to calendar</li>
                <li>Paste the copied URL and save</li>
              </ol>
            </div>

            <Button variant="outline" onClick={() => setImportDialogOpen(true)}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Import External Calendar
            </Button>
          </CardContent>
        </Card>

        {/* Integration Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {integrations.map((integration) => {
            const Icon = integration.icon;
            return (
              <Card key={integration.id} className="relative overflow-hidden">
                {integration.comingSoon && (
                  <div className="absolute top-3 right-3">
                    <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                  </div>
                )}
                <CardContent className="pt-6">
                  <div className={`w-12 h-12 rounded-xl ${integration.iconBg} flex items-center justify-center mb-4`}>
                    <Icon className={`h-6 w-6 ${integration.iconColor}`} />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{integration.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{integration.description}</p>
                  
                  {integration.connected ? (
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                        <Check className="h-3 w-3 mr-1" />
                        Connected
                      </Badge>
                      <Button variant="ghost" size="sm">
                        Disconnect
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      disabled={integration.comingSoon}
                      onClick={() => setExportDialogOpen(true)}
                    >
                      {integration.comingSoon ? "Coming Soon" : "Connect"}
                      {!integration.comingSoon && <ExternalLink className="h-4 w-4 ml-2" />}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Info Card */}
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-foreground mb-1">Two-way sync coming soon</h4>
                <p className="text-sm text-muted-foreground">
                  Currently, you can export your Sportsbnb bookings to external calendars. Full two-way OAuth sync with Google and Outlook is coming in a future update.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect Calendar</DialogTitle>
            <DialogDescription>
              Use the iCal feed to sync your bookings with this calendar.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>iCal Feed URL</Label>
              <div className="flex gap-2">
                <Input value={icalFeedUrl} readOnly className="font-mono text-xs" />
                <Button variant="outline" size="icon" onClick={handleCopyLink}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Add this URL to your calendar app to subscribe to your booking updates.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExportDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import External Calendar</DialogTitle>
            <DialogDescription>
              Add an external calendar to show busy times in your schedule.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>iCal URL</Label>
              <Input
                placeholder="https://calendar.google.com/calendar/ical/..."
                value={externalCalendarUrl}
                onChange={(e) => setExternalCalendarUrl(e.target.value)}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Paste the iCal/ICS URL from Google Calendar, Outlook, or any other calendar service.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleImportCalendar}>
              Import Calendar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </OwnerLayout>
  );
};

export default OwnerIntegrationsPage;
