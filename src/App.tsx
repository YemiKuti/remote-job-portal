
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/AuthProvider";
import Index from "./pages/Index";
import Pricing from "./pages/Pricing";
import JobScraper from "./pages/JobScraper";
import Blog from "./pages/Blog";
import AdminDashboard from "./pages/AdminDashboard";
import BlogManagement from "./pages/admin/BlogManagement";
import BlogEditor from "./pages/admin/BlogEditor";
import CandidateDashboard from "./pages/CandidateDashboard";
import EmployerDashboard from "./pages/EmployerDashboard"; 
import SignIn from "./pages/SignIn";
import AuthPage from "./pages/Auth";
import Profile from "./pages/Profile";
import Account from "./pages/Account";
import NotFound from "./pages/NotFound";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import CandidateProfile from "./pages/candidate/Profile";
import CandidateApplications from "./pages/candidate/Applications";
import CandidateMessages from "./pages/candidate/Messages";
import CandidateSavedJobs from "./pages/candidate/SavedJobs";
import CandidateSettings from "./pages/candidate/Settings";
import EmployerJobs from "./pages/employer/Jobs";
import EmployerCandidates from "./pages/employer/Candidates";
import EmployerCompany from "./pages/employer/Company";
import EmployerMessages from "./pages/employer/Messages";
import EmployerSettings from "./pages/employer/Settings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000, // 1 minute
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <div className="w-full">
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/job-scraper" element={<JobScraper />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/account" element={<Account />} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/blog" element={<BlogManagement />} />
                <Route path="/admin/blog/create" element={<BlogEditor />} />
                <Route path="/admin/blog/edit/:id" element={<BlogEditor />} />
                
                {/* Candidate Routes */}
                <Route path="/candidate" element={<CandidateDashboard />} />
                <Route path="/candidate/profile" element={<CandidateProfile />} />
                <Route path="/candidate/applications" element={<CandidateApplications />} />
                <Route path="/candidate/messages" element={<CandidateMessages />} />
                <Route path="/candidate/saved-jobs" element={<CandidateSavedJobs />} />
                <Route path="/candidate/settings" element={<CandidateSettings />} />
                
                {/* Employer Routes */}
                <Route path="/employer" element={<EmployerDashboard />} />
                <Route path="/employer/jobs" element={<EmployerJobs />} />
                <Route path="/employer/candidates" element={<EmployerCandidates />} />
                <Route path="/employer/company" element={<EmployerCompany />} />
                <Route path="/employer/messages" element={<EmployerMessages />} />
                <Route path="/employer/settings" element={<EmployerSettings />} />
                
                <Route path="/checkout/success" element={<CheckoutSuccess />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </div>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
