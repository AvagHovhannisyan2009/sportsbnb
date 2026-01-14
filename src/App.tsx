import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import HomePage from "./pages/HomePage";
import DiscoverPage from "./pages/DiscoverPage";
import GamesPage from "./pages/GamesPage";
import CreateGamePage from "./pages/CreateGamePage";
import GameDetailsPage from "./pages/GameDetailsPage";
import VenueDetailsPage from "./pages/VenueDetailsPage";
import PlayerDashboard from "./pages/PlayerDashboard";
import OwnerDashboard from "./pages/OwnerDashboard";
import AddVenuePage from "./pages/AddVenuePage";
import EditVenuePage from "./pages/EditVenuePage";
import VenueAvailabilityPage from "./pages/VenueAvailabilityPage";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import FAQPage from "./pages/FAQPage";
import ProfilePage from "./pages/ProfilePage";
import PlayerOnboarding from "./pages/PlayerOnboarding";
import OwnerOnboarding from "./pages/OwnerOnboarding";
import BookingSuccessPage from "./pages/BookingSuccessPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsOfServicePage from "./pages/TermsOfServicePage";
import CookiePolicyPage from "./pages/CookiePolicyPage";
import NotFound from "./pages/NotFound";
import Layout from "./components/layout/Layout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout showMobileNav={false}><HomePage /></Layout>} />
            <Route path="/discover" element={<DiscoverPage />} />
            <Route path="/games" element={<GamesPage />} />
            <Route path="/create-game" element={<ProtectedRoute><CreateGamePage /></ProtectedRoute>} />
            <Route path="/game/:id" element={<GameDetailsPage />} />
            <Route path="/venue/:id" element={<VenueDetailsPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><PlayerDashboard /></ProtectedRoute>} />
            <Route path="/owner-dashboard" element={<ProtectedRoute><OwnerDashboard /></ProtectedRoute>} />
            <Route path="/add-venue" element={<ProtectedRoute><AddVenuePage /></ProtectedRoute>} />
            <Route path="/venue/:id/edit" element={<ProtectedRoute><EditVenuePage /></ProtectedRoute>} />
            <Route path="/venue/:id/availability" element={<ProtectedRoute><VenueAvailabilityPage /></ProtectedRoute>} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/onboarding/player" element={<ProtectedRoute><PlayerOnboarding /></ProtectedRoute>} />
            <Route path="/onboarding/owner" element={<ProtectedRoute><OwnerOnboarding /></ProtectedRoute>} />
            <Route path="/list-venue" element={<ProtectedRoute><OwnerOnboarding /></ProtectedRoute>} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsOfServicePage />} />
            <Route path="/cookies" element={<CookiePolicyPage />} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/booking-success" element={<ProtectedRoute><BookingSuccessPage /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
