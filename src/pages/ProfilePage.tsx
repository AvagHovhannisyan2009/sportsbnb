import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { User, Bell, CreditCard, Shield, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const ProfilePage = () => {
  return (
    <Layout>
      <div className="bg-background min-h-screen">
        <div className="container py-8">
          <h1 className="text-3xl font-bold text-foreground mb-8">Profile & Settings</h1>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <nav className="space-y-1">
                {[
                  { icon: User, label: "Profile", active: true },
                  { icon: Bell, label: "Notifications" },
                  { icon: CreditCard, label: "Payment Methods" },
                  { icon: Shield, label: "Security" },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        item.active
                          ? "bg-accent text-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </button>
                  );
                })}
                <Separator className="my-4" />
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors">
                  <LogOut className="h-5 w-5" />
                  Sign out
                </button>
              </nav>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Profile Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal details and public profile.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-6">
                    <Avatar className="h-20 w-20">
                      <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                        JD
                      </AvatarFallback>
                    </Avatar>
                    <Button variant="outline">Change photo</Button>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First name</Label>
                      <Input id="firstName" defaultValue="John" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last name</Label>
                      <Input id="lastName" defaultValue="Doe" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue="john@example.com" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone number</Label>
                    <Input id="phone" type="tel" defaultValue="+1 (555) 123-4567" />
                  </div>

                  <Button>Save changes</Button>
                </CardContent>
              </Card>

              {/* Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>
                    Choose what notifications you want to receive.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: "Booking confirmations", description: "Get notified when your booking is confirmed", defaultChecked: true },
                    { label: "Game updates", description: "Receive updates about games you've joined", defaultChecked: true },
                    { label: "New games nearby", description: "Get notified when new games are posted in your area", defaultChecked: false },
                    { label: "Marketing emails", description: "Receive tips, updates, and promotions", defaultChecked: false },
                  ].map((notification) => (
                    <div key={notification.label} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-foreground">{notification.label}</div>
                        <div className="text-sm text-muted-foreground">{notification.description}</div>
                      </div>
                      <Switch defaultChecked={notification.defaultChecked} />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Danger Zone */}
              <Card className="border-destructive/20">
                <CardHeader>
                  <CardTitle className="text-destructive">Danger Zone</CardTitle>
                  <CardDescription>
                    Irreversible and destructive actions.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="destructive">Delete account</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
