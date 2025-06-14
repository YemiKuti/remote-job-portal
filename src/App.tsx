
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import Index from './pages/Index';
import JobsBrowse from './pages/JobsBrowse';
import JobDetail from './pages/JobDetail';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Pricing from './pages/Pricing';
import FAQ from './pages/FAQ';
import BlogPost from './pages/BlogPost';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import NotFound from './pages/NotFound';
import AuthPage from './pages/Auth';

import EmployerDashboard from './pages/EmployerDashboard';
import Jobs from './pages/employer/Jobs';
import PostJob from './pages/employer/PostJob';
import EditJob from './pages/employer/EditJob';
import Settings from './pages/employer/Settings';
import Messages from './pages/employer/Messages';

import AdminDashboard from './pages/AdminDashboard';
import Companies from './pages/admin/Companies';
import Users from './pages/admin/Users';
import AdminSettings from './pages/admin/Settings';
import CreateJob from './pages/admin/CreateJob';
import AdminEditJob from './pages/admin/EditJob';
import AdminJobs from './pages/admin/Jobs';
import BlogManagement from './pages/admin/BlogManagement';
import BlogEditor from './pages/admin/BlogEditor';

import CandidateDashboard from './pages/CandidateDashboard';
import CandidateProfile from './pages/candidate/Profile';
import CandidateApplications from './pages/candidate/Applications';
import CandidateSavedJobs from './pages/candidate/SavedJobs';
import CandidateMessages from './pages/candidate/Messages';
import CandidateSettings from './pages/candidate/Settings';
import TailoredResumes from './pages/candidate/TailoredResumes';

import { AuthProvider } from './components/AuthProvider';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Toaster />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/jobs" element={<JobsBrowse />} />
            <Route path="/jobs/:id" element={<JobDetail />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="*" element={<NotFound />} />

            {/* Employer Routes */}
            <Route path="/employer" element={<EmployerDashboard />} />
            <Route path="/employer/jobs" element={<Jobs />} />
            <Route path="/employer/jobs/new" element={<PostJob />} />
            <Route path="/employer/jobs/:id/edit" element={<EditJob />} />
            <Route path="/employer/messages" element={<Messages />} />
            <Route path="/employer/settings" element={<Settings />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin-signin" element={<AdminDashboard />} />
            <Route path="/admin/jobs" element={<AdminJobs />} />
            <Route path="/admin/jobs/new" element={<CreateJob />} />
            <Route path="/admin/jobs/:id/edit" element={<AdminEditJob />} />
            <Route path="/admin/companies" element={<Companies />} />
            <Route path="/admin/users" element={<Users />} />
            <Route path="/admin/blog" element={<BlogManagement />} />
            <Route path="/admin/blog/create" element={<BlogEditor />} />
            <Route path="/admin/settings" element={<AdminSettings />} />

            {/* Candidate Routes */}
            <Route path="/candidate" element={<CandidateDashboard />} />
            <Route path="/candidate/profile" element={<CandidateProfile />} />
            <Route path="/candidate/applications" element={<CandidateApplications />} />
            <Route path="/candidate/saved-jobs" element={<CandidateSavedJobs />} />
            <Route path="/candidate/tailored-resumes" element={<TailoredResumes />} />
            <Route path="/candidate/messages" element={<CandidateMessages />} />
            <Route path="/candidate/settings" element={<CandidateSettings />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
