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
import InstallPage from "./pages/InstallPage";
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
            <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
              <h1>✓ Sportsbnb App Loaded</h1>
              <p>Supabase Connected: Check console</p>
            </div>
          </TooltipProvider>
        </CurrencyProvider>
      </AuthProvider>
    </QueryClientProvider>
);
              
              {/* Venue Management */}
              <Route path="/add-venue" element={<ProtectedRoute><AddVenuePage /></ProtectedRoute>} />
              <Route path="/venue/:id/edit" element={<ProtectedRoute><EditVenuePage /></ProtectedRoute>} />
              <Route path="/venue/:id/availability" element={<ProtectedRoute><VenueAvailabilityPage /></ProtectedRoute>} />
              <Route path="/my-venues" element={<ProtectedRoute><MyVenuesPage /></ProtectedRoute>} />
              {/* Auth */}
              <Route path="/signup" element={<SignupPage />} />

export default App;
