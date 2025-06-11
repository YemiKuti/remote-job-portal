import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "./components/AuthProvider";
import AdminRoute from "./components/AdminRoute";
import Index from "./pages/Index";
import Pricing from "./pages/Pricing";
import JobScraper from "./pages/JobScraper";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import AdminDashboard from "./pages/AdminDashboard";
import BlogManagement from "./pages/admin/BlogManagement";
import BlogEditor from "./pages/admin/BlogEditor";
import UsersAdmin from "./pages/admin/Users";
import JobsAdmin from "./pages/admin/Jobs";
import CreateJob from "./pages/admin/CreateJob";
import EditJob from "./pages/admin/EditJob";
import CompaniesAdmin from "./pages/admin/Companies";
import SettingsAdmin from "./pages/admin/Settings";
import AdminProfile from "./pages/admin/Profile";
import CandidateDashboard from "./pages/CandidateDashboard";
import EmployerDashboard from "./pages/EmployerDashboard"; 
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import AdminSignIn from "./pages/AdminSignIn";
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
import PostJob from "./pages/employer/PostJob";
import EditJobPage from "./pages/employer/EditJob";
import EmployerCandidates from "./pages/employer/Candidates";
import EmployerCompany from "./pages/employer/Company";
import EmployerMessages from "./pages/employer/Messages";
import EmployerSettings from "./pages/employer/Settings";
import JobDetail from "./pages/JobDetail";
import FAQ from "./pages/FAQ";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import JobsBrowse from "./pages/JobsBrowse";

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
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <BrowserRouter>
            <AuthProvider>
              <div className="w-full">
                <Toaster />
                <Sonner />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/jobs" element={<JobsBrowse />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/job-scraper" element={<JobScraper />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:id" element={<BlogPost />} />
                  <Route path="/signin" element={<SignIn />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/admin-signin" element={<AdminSignIn />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/account" element={<Account />} />
                  <Route path="/jobs/:jobId" element={<JobDetail />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/terms-of-service" element={<TermsOfService />} />
                  
                  {/* Protected Admin Routes */}
                  <Route element={<AdminRoute />}>
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/profile" element={<AdminProfile />} />
                    <Route path="/admin/blog" element={<BlogManagement />} />
                    <Route path="/admin/blog/create" element={<BlogEditor />} />
                    <Route path="/admin/blog/edit/:id" element={<BlogEditor />} />
                    <Route path="/admin/users" element={<UsersAdmin />} />
                    <Route path="/admin/jobs" element={<JobsAdmin />} />
                    <Route path="/admin/create-job" element={<CreateJob />} />
                    <Route path="/admin/edit-job/:jobId" element={<EditJob />} />
                    <Route path="/admin/companies" element={<CompaniesAdmin />} />
                    <Route path="/admin/settings" element={<SettingsAdmin />} />
                  </Route>
                  
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
                  <Route path="/employer/post-job" element={<PostJob />} />
                  <Route path="/employer/edit-job/:jobId" element={<EditJobPage />} />
                  <Route path="/employer/candidates" element={<EmployerCandidates />} />
                  <Route path="/employer/company" element={<EmployerCompany />} />
                  <Route path="/employer/messages" element={<EmployerMessages />} />
                  <Route path="/employer/settings" element={<EmployerSettings />} />
                  
                  {/* Redirect old PostJob route to employer route */}
                  <Route path="/post-job" element={<Navigate to="/employer/post-job" replace />} />
                  
                  <Route path="/checkout/success" element={<CheckoutSuccess />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;
