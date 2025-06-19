
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import Index from './pages/Index';
import JobsBrowse from './pages/JobsBrowse';
import JobDetail from './pages/JobDetail';
import SignIn from './pages/SignIn';
import Pricing from './pages/Pricing';
import FAQ from './pages/FAQ';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import NotFound from './pages/NotFound';
import AuthPage from './pages/Auth';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import UserProfilePage from './pages/UserProfilePage';

import EmployerDashboard from './pages/EmployerDashboard';
import Jobs from './pages/employer/Jobs';
import PostJob from './pages/employer/PostJob';
import EditJob from './pages/employer/EditJob';
import Settings from './pages/employer/Settings';
import Messages from './pages/employer/Messages';
import Candidates from './pages/employer/Candidates';
import EmployerCompany from './pages/employer/Company';

import AdminDashboard from './pages/AdminDashboard';
import AdminSignIn from './pages/AdminSignIn';
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
import { AdminRoute } from './components/AdminRoute';
import { ProtectedEmployerRoute } from './components/employer/ProtectedEmployerRoute';

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
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/user/:userId" element={<UserProfilePage />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="*" element={<NotFound />} />

            {/* Admin Sign-in Route (Public but redirects if already admin) */}
            <Route path="/admin-signin" element={<AdminSignIn />} />

            {/* Protected Employer Routes */}
            <Route path="/employer" element={
              <ProtectedEmployerRoute>
                <EmployerDashboard />
              </ProtectedEmployerRoute>
            } />
            <Route path="/employer/jobs" element={
              <ProtectedEmployerRoute>
                <Jobs />
              </ProtectedEmployerRoute>
            } />
            <Route path="/employer/jobs/new" element={
              <ProtectedEmployerRoute>
                <PostJob />
              </ProtectedEmployerRoute>
            } />
            <Route path="/employer/jobs/:id/edit" element={
              <ProtectedEmployerRoute>
                <EditJob />
              </ProtectedEmployerRoute>
            } />
            <Route path="/employer/candidates" element={
              <ProtectedEmployerRoute>
                <Candidates />
              </ProtectedEmployerRoute>
            } />
            <Route path="/employer/company" element={
              <ProtectedEmployerRoute>
                <EmployerCompany />
              </ProtectedEmployerRoute>
            } />
            <Route path="/employer/messages" element={
              <ProtectedEmployerRoute>
                <Messages />
              </ProtectedEmployerRoute>
            } />
            <Route path="/employer/settings" element={
              <ProtectedEmployerRoute>
                <Settings />
              </ProtectedEmployerRoute>
            } />

            {/* Protected Admin Routes */}
            <Route path="/admin" element={<AdminRoute />}>
              <Route index element={<AdminDashboard />} />
              <Route path="jobs" element={<AdminJobs />} />
              <Route path="jobs/new" element={<CreateJob />} />
              <Route path="jobs/:id/edit" element={<AdminEditJob />} />
              <Route path="companies" element={<Companies />} />
              <Route path="users" element={<Users />} />
              <Route path="blog" element={<BlogManagement />} />
              <Route path="blog/create" element={<BlogEditor />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

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
