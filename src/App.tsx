import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
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
            <Route path="/create-game" element={<CreateGamePage />} />
            <Route path="/game/:id" element={<GameDetailsPage />} />
            <Route path="/venue/:id" element={<VenueDetailsPage />} />
            <Route path="/dashboard" element={<PlayerDashboard />} />
            <Route path="/owner-dashboard" element={<OwnerDashboard />} />
            <Route path="/add-venue" element={<AddVenuePage />} />
            <Route path="/venue/:id/edit" element={<EditVenuePage />} />
            <Route path="/venue/:id/availability" element={<VenueAvailabilityPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/onboarding/player" element={<PlayerOnboarding />} />
            <Route path="/onboarding/owner" element={<OwnerOnboarding />} />
            <Route path="/list-venue" element={<OwnerOnboarding />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/booking-success" element={<BookingSuccessPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
