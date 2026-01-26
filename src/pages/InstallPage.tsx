import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone, Share, PlusSquare, MoreVertical, Download, Check, Apple, Chrome } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const InstallPage = () => {
  const { t } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
    setIsAndroid(/android/.test(userAgent));

    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <Layout>
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-2xl mb-6">
            <Smartphone className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Install Sportsbnb 📲
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get the full app experience! Install Sportsbnb on your phone for quick access, 
            offline support, and instant notifications about your bookings.
          </p>
        </section>

        {/* Already Installed */}
        {isInstalled && (
          <Card className="mb-8 border-green-500/50 bg-green-500/10">
            <CardContent className="flex items-center gap-4 py-6">
              <div className="flex items-center justify-center w-12 h-12 bg-green-500/20 rounded-full">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-green-700 dark:text-green-400">
                  Already Installed! 🎉
                </h3>
                <p className="text-sm text-muted-foreground">
                  You're using the installed app. Enjoy the full experience!
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Install Button (Android/Chrome) */}
        {deferredPrompt && !isInstalled && (
          <Card className="mb-8 border-primary/50 bg-primary/5">
            <CardContent className="py-6">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="font-semibold mb-1">Ready to install!</h3>
                  <p className="text-sm text-muted-foreground">
                    Click the button to add Sportsbnb to your home screen
                  </p>
                </div>
                <Button onClick={handleInstallClick} size="lg" className="gap-2">
                  <Download className="h-5 w-5" />
                  Install Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Installation Instructions */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* iOS Instructions */}
          <Card className={isIOS ? "ring-2 ring-primary" : ""}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-muted rounded-lg">
                  <Apple className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">iPhone & iPad</CardTitle>
                  <CardDescription>Safari browser</CardDescription>
                </div>
              </div>
              {isIOS && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full w-fit">
                  You're on iOS
                </span>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-primary/10 text-primary rounded-full text-sm font-semibold shrink-0">
                  1
                </div>
                <div>
                  <p className="font-medium">Tap the Share button</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    Look for the <Share className="h-4 w-4 inline" /> icon at the bottom of Safari
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-primary/10 text-primary rounded-full text-sm font-semibold shrink-0">
                  2
                </div>
                <div>
                  <p className="font-medium">Scroll and tap "Add to Home Screen"</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    Look for the <PlusSquare className="h-4 w-4 inline" /> icon in the menu
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-primary/10 text-primary rounded-full text-sm font-semibold shrink-0">
                  3
                </div>
                <div>
                  <p className="font-medium">Tap "Add" to confirm</p>
                  <p className="text-sm text-muted-foreground">
                    The app icon will appear on your home screen
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Android Instructions */}
          <Card className={isAndroid ? "ring-2 ring-primary" : ""}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-muted rounded-lg">
                  <Chrome className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">Android</CardTitle>
                  <CardDescription>Chrome browser</CardDescription>
                </div>
              </div>
              {isAndroid && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full w-fit">
                  You're on Android
                </span>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-primary/10 text-primary rounded-full text-sm font-semibold shrink-0">
                  1
                </div>
                <div>
                  <p className="font-medium">Tap the menu button</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    Look for <MoreVertical className="h-4 w-4 inline" /> (three dots) in Chrome
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-primary/10 text-primary rounded-full text-sm font-semibold shrink-0">
                  2
                </div>
                <div>
                  <p className="font-medium">Tap "Add to Home Screen"</p>
                  <p className="text-sm text-muted-foreground">
                    Or "Install App" if you see that option
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-primary/10 text-primary rounded-full text-sm font-semibold shrink-0">
                  3
                </div>
                <div>
                  <p className="font-medium">Tap "Add" or "Install"</p>
                  <p className="text-sm text-muted-foreground">
                    The app will be added to your home screen
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Benefits Section */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-center mb-8">Why install the app? ✨</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="text-center p-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4">
                <Smartphone className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Quick Access</h3>
              <p className="text-sm text-muted-foreground">
                Launch directly from your home screen—no browser needed
              </p>
            </Card>
            
            <Card className="text-center p-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4">
                <Download className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Works Offline</h3>
              <p className="text-sm text-muted-foreground">
                Browse venues even without an internet connection
              </p>
            </Card>
            
            <Card className="text-center p-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4">
                <Check className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Full Screen</h3>
              <p className="text-sm text-muted-foreground">
                Enjoy a native app experience without browser bars
              </p>
            </Card>
            
            <Card className="text-center p-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4">
                <Smartphone className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Fast & Light</h3>
              <p className="text-sm text-muted-foreground">
                No app store download—installs instantly from your browser
              </p>
            </Card>
          </div>
        </section>
      </main>
    </Layout>
  );
};

export default InstallPage;
