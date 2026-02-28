import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Directory from "./pages/Directory";
import BusinessProfile from "./pages/BusinessProfile";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import Membership from "./pages/Membership";
import TradeMatch from "./pages/TradeMatch";
import MemberDashboard from "./pages/MemberDashboard";
import Subscription from "./pages/Subscription";
import Profile from "./pages/Profile";
import KYCVerification from "./pages/KYCVerification";
import Disputes from "./pages/Disputes";
import DealRoom from "./pages/DealRoom";
import AdminDashboard from "./pages/AdminDashboard";
import AdminBusinesses from "./pages/AdminBusinesses";
import AdminEvents from "./pages/AdminEvents";
import AdminMatches from "./pages/AdminMatches";
import AdminSubscriptions from "./pages/AdminSubscriptions";
import AdminActivity from "./pages/AdminActivity";
import AdminKYCQueue from "./pages/AdminKYCQueue";
import AdminDisputes from "./pages/AdminDisputes";
import NotFound from "./pages/NotFound";
import AIAdvisor from "./pages/AIAdvisor";
import TradeIntelligence from "./pages/TradeIntelligence";
import MarketingAutomation from "./pages/MarketingAutomation";
import AboutUs from "./pages/AboutUs";
import OurServices from "./pages/OurServices";
import PartnersPage from "./pages/Partners";
import ContactUs from "./pages/ContactUs";
import NewsEvents from "./pages/NewsEvents";
import TrainingProgrammes from "./pages/TrainingProgrammes";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/services" element={<OurServices />} />
            <Route path="/partners" element={<PartnersPage />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/news" element={<NewsEvents />} />
            <Route path="/training" element={<TrainingProgrammes />} />
            <Route path="/directory" element={<Directory />} />
            <Route path="/directory/:id" element={<BusinessProfile />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:id" element={<EventDetail />} />
            <Route path="/membership" element={<Membership />} />
            {/* Member */}
            <Route path="/dashboard" element={<MemberDashboard />} />
            <Route path="/matches" element={<TradeMatch />} />
            <Route path="/subscription" element={<Subscription />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/verification" element={<KYCVerification />} />
            <Route path="/disputes" element={<Disputes />} />
            <Route path="/deals" element={<DealRoom />} />
            <Route path="/advisor" element={<AIAdvisor />} />
            <Route path="/intelligence" element={<TradeIntelligence />} />
            {/* Admin */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/businesses" element={<AdminBusinesses />} />
            <Route path="/admin/events" element={<AdminEvents />} />
            <Route path="/admin/matches" element={<AdminMatches />} />
            <Route path="/admin/subscriptions" element={<AdminSubscriptions />} />
            <Route path="/admin/activity" element={<AdminActivity />} />
            <Route path="/admin/kyc" element={<AdminKYCQueue />} />
            <Route path="/admin/disputes" element={<AdminDisputes />} />
            <Route path="/admin/marketing" element={<MarketingAutomation />} />
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
