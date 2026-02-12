import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { CurrencyProvider } from "@/hooks/useCurrency";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminRoute } from "@/components/admin/AdminRoute";
import HomePage from "./pages/HomePage";
import DiscoverPage from "./pages/DiscoverPage";
import CommunityPage from "./pages/CommunityPage";
import GamesPage from "./pages/GamesPage";
import CreateGamePage from "./pages/CreateGamePage";
import GameDetailsPage from "./pages/GameDetailsPage";
import GameJoinSuccessPage from "./pages/GameJoinSuccessPage";
import VenueDetailsPage from "./pages/VenueDetailsPage";
import PlayerDashboard from "./pages/PlayerDashboard";
import OwnerDashboard from "./pages/OwnerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AddVenuePage from "./pages/AddVenuePage";
import EditVenuePage from "./pages/EditVenuePage";
import VenueAvailabilityPage from "./pages/VenueAvailabilityPage";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
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
import MyVenuesPage from "./pages/MyVenuesPage";
import OwnerSchedulePage from "./pages/OwnerSchedulePage";
import MessagesPage from "./pages/MessagesPage";
import NotFound from "./pages/NotFound";
import Layout from "./components/layout/Layout";

// Owner Dashboard Pages
import OwnerOverviewPage from "./pages/owner/OwnerOverviewPage";
import OwnerSchedulePageNew from "./pages/owner/OwnerSchedulePage";
import OwnerHoursPage from "./pages/owner/OwnerHoursPage";
import OwnerVenuesPage from "./pages/owner/OwnerVenuesPage";
import OwnerBookingsPage from "./pages/owner/OwnerBookingsPage";
import OwnerPricingPage from "./pages/owner/OwnerPricingPage";
import OwnerEquipmentPage from "./pages/owner/OwnerEquipmentPage";
import OwnerIntegrationsPage from "./pages/owner/OwnerIntegrationsPage";
import OwnerPoliciesPage from "./pages/owner/OwnerPoliciesPage";
import OwnerSettingsPage from "./pages/owner/OwnerSettingsPage";
import OwnerWidgetPage from "./pages/owner/OwnerWidgetPage";
import CalendarCallbackPage from "./pages/owner/CalendarCallbackPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import EmbedBookingPage from "./pages/EmbedBookingPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CurrencyProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout showMobileNav={false}><HomePage /></Layout>} />
              {/* Venues - renamed from Discover */}
              <Route path="/venues" element={<DiscoverPage />} />
              <Route path="/discover" element={<Navigate to="/venues" replace />} />
              {/* Games */}
              <Route path="/games" element={<GamesPage />} />
              <Route path="/community" element={<CommunityPage />} />
              <Route path="/create-game" element={<ProtectedRoute><CreateGamePage /></ProtectedRoute>} />
              <Route path="/game/:id" element={<GameDetailsPage />} />
              <Route path="/game/:id/join-success" element={<ProtectedRoute><GameJoinSuccessPage /></ProtectedRoute>} />
              {/* Venue Details */}
              <Route path="/venue/:id" element={<VenueDetailsPage />} />
              {/* Dashboards */}
              <Route path="/dashboard" element={<ProtectedRoute><PlayerDashboard /></ProtectedRoute>} />
              <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
              
              {/* New Owner Dashboard Routes */}
              <Route path="/owner-dashboard" element={<ProtectedRoute><OwnerOverviewPage /></ProtectedRoute>} />
              <Route path="/owner/venues" element={<ProtectedRoute><OwnerVenuesPage /></ProtectedRoute>} />
              <Route path="/owner/schedule" element={<ProtectedRoute><OwnerSchedulePageNew /></ProtectedRoute>} />
              <Route path="/owner/bookings" element={<ProtectedRoute><OwnerBookingsPage /></ProtectedRoute>} />
              <Route path="/owner/hours" element={<ProtectedRoute><OwnerHoursPage /></ProtectedRoute>} />
              <Route path="/owner/pricing" element={<ProtectedRoute><OwnerPricingPage /></ProtectedRoute>} />
              <Route path="/owner/equipment" element={<ProtectedRoute><OwnerEquipmentPage /></ProtectedRoute>} />
              <Route path="/owner/integrations" element={<ProtectedRoute><OwnerIntegrationsPage /></ProtectedRoute>} />
              <Route path="/owner/integrations/callback" element={<ProtectedRoute><CalendarCallbackPage /></ProtectedRoute>} />
              <Route path="/owner/policies" element={<ProtectedRoute><OwnerPoliciesPage /></ProtectedRoute>} />
              <Route path="/owner/settings" element={<ProtectedRoute><OwnerSettingsPage /></ProtectedRoute>} />
              <Route path="/owner/widget" element={<ProtectedRoute><OwnerWidgetPage /></ProtectedRoute>} />
              
              {/* Embed booking widget (public) */}
              <Route path="/embed/booking/:venueId" element={<EmbedBookingPage />} />
              
              {/* Auth callback for magic link */}
              <Route path="/auth/callback" element={<AuthCallbackPage />} />
              
              {/* Legacy owner routes */}
              <Route path="/owner-schedule" element={<ProtectedRoute><OwnerSchedulePage /></ProtectedRoute>} />
              
              {/* Venue Management */}
              <Route path="/add-venue" element={<ProtectedRoute><AddVenuePage /></ProtectedRoute>} />
              <Route path="/venue/:id/edit" element={<ProtectedRoute><EditVenuePage /></ProtectedRoute>} />
              <Route path="/venue/:id/availability" element={<ProtectedRoute><VenueAvailabilityPage /></ProtectedRoute>} />
              <Route path="/my-venues" element={<ProtectedRoute><MyVenuesPage /></ProtectedRoute>} />
              {/* Auth */}
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              {/* Onboarding */}
              <Route path="/onboarding/player" element={<ProtectedRoute><PlayerOnboarding /></ProtectedRoute>} />
              <Route path="/onboarding/owner" element={<ProtectedRoute><OwnerOnboarding /></ProtectedRoute>} />
              <Route path="/list-venue" element={<ProtectedRoute><OwnerOnboarding /></ProtectedRoute>} />
              {/* Settings - redirect to profile */}
              <Route path="/settings" element={<Navigate to="/profile" replace />} />
              {/* Info Pages */}
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
              <Route path="/terms" element={<TermsOfServicePage />} />
              <Route path="/cookies" element={<CookiePolicyPage />} />
              {/* Profile & Billing */}
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/booking-success" element={<ProtectedRoute><BookingSuccessPage /></ProtectedRoute>} />
              {/* Admin */}
              <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CurrencyProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
