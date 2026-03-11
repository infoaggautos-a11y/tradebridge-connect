import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";
import ResetPassword from "./pages/ResetPassword";
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
import FinanceDashboard from "./pages/FinanceDashboard";
import Wallet from "./pages/Wallet";
import AboutUs from "./pages/AboutUs";
import OurServices from "./pages/OurServices";
import PartnersPage from "./pages/Partners";
import ContactUs from "./pages/ContactUs";
import NewsEvents from "./pages/NewsEvents";
import NewsArticle from "./pages/NewsArticle";
import TrainingProgrammes from "./pages/TrainingProgrammes";
import { PlanProtectedRoute } from "@/components/access/PlanProtectedRoute";
import BusinessRegistration from "./pages/BusinessRegistration";

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
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/services" element={<OurServices />} />
            <Route path="/partners" element={<PartnersPage />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/news" element={<NewsEvents />} />
            <Route path="/news/:slug" element={<NewsArticle />} />
            <Route path="/training" element={<TrainingProgrammes />} />
            <Route path="/directory" element={<Directory />} />
            <Route path="/directory/:id" element={<BusinessProfile />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:id" element={<EventDetail />} />
            <Route path="/membership" element={<Membership />} />
            <Route path="/register-business" element={<BusinessRegistration />} />

            {/* Member (protected) */}
            <Route path="/dashboard" element={<ProtectedRoute><MemberDashboard /></ProtectedRoute>} />
            <Route path="/matches" element={<ProtectedRoute><TradeMatch /></ProtectedRoute>} />
            <Route path="/subscription" element={<ProtectedRoute><Subscription /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/verification" element={<ProtectedRoute><KYCVerification /></ProtectedRoute>} />
            <Route path="/disputes" element={<ProtectedRoute><Disputes /></ProtectedRoute>} />
            <Route path="/deals" element={<ProtectedRoute><PlanProtectedRoute requiredTier="starter" feature="deal-room"><DealRoom /></PlanProtectedRoute></ProtectedRoute>} />
            <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
            <Route path="/advisor" element={<ProtectedRoute><PlanProtectedRoute requiredTier="growth" feature="ai-advisor"><AIAdvisor /></PlanProtectedRoute></ProtectedRoute>} />
            <Route path="/intelligence" element={<ProtectedRoute><PlanProtectedRoute requiredTier="starter" feature="trade-intelligence"><TradeIntelligence /></PlanProtectedRoute></ProtectedRoute>} />

            {/* Admin (protected + admin required) */}
            <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/businesses" element={<ProtectedRoute requireAdmin><AdminBusinesses /></ProtectedRoute>} />
            <Route path="/admin/events" element={<ProtectedRoute requireAdmin><AdminEvents /></ProtectedRoute>} />
            <Route path="/admin/matches" element={<ProtectedRoute requireAdmin><AdminMatches /></ProtectedRoute>} />
            <Route path="/admin/subscriptions" element={<ProtectedRoute requireAdmin><AdminSubscriptions /></ProtectedRoute>} />
            <Route path="/admin/activity" element={<ProtectedRoute requireAdmin><AdminActivity /></ProtectedRoute>} />
            <Route path="/admin/kyc" element={<ProtectedRoute requireAdmin><AdminKYCQueue /></ProtectedRoute>} />
            <Route path="/admin/disputes" element={<ProtectedRoute requireAdmin><AdminDisputes /></ProtectedRoute>} />
            <Route path="/admin/marketing" element={<ProtectedRoute requireAdmin><MarketingAutomation /></ProtectedRoute>} />
            <Route path="/admin/finance" element={<ProtectedRoute requireAdmin><FinanceDashboard /></ProtectedRoute>} />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
