
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import Account from '@/pages/Account'
import Index from '@/pages/Index'
import Pricing from '@/pages/Pricing'
import AuthPage from '@/pages/Auth'
import JobsBrowse from '@/pages/JobsBrowse'
import JobDetail from '@/pages/JobDetail'
import JobScraper from '@/pages/JobScraper'
import Blog from '@/pages/Blog'
import EmployerDashboard from '@/pages/EmployerDashboard';
import EmployerJobs from '@/pages/employer/Jobs';
import PostJob from '@/pages/employer/PostJob';
import EditJob from '@/pages/employer/EditJob';
import Candidates from '@/pages/employer/Candidates';
import EmployerMessages from '@/pages/employer/Messages';
import Company from '@/pages/employer/Company';
import EmployerSettings from '@/pages/employer/Settings';
import NotFound from '@/pages/NotFound';
import { ProtectedEmployerRoute } from '@/components/employer/ProtectedEmployerRoute';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AuthProvider } from '@/components/AuthProvider';
import EmployerSubscription from "@/pages/employer/Subscription";
import CandidateDashboard from '@/pages/CandidateDashboard';
import CandidateProfile from '@/pages/candidate/Profile';
import CandidateApplications from '@/pages/candidate/Applications';
import CandidateSavedJobs from '@/pages/candidate/SavedJobs';
import TailoredResumes from '@/pages/candidate/TailoredResumes';
import CandidateMessages from '@/pages/candidate/Messages';
import CandidateSettings from '@/pages/candidate/Settings';
import Profile from '@/pages/Profile';
import AdminSignIn from '@/pages/AdminSignIn';
import AdminDashboard from '@/pages/AdminDashboard';
import UsersAdmin from '@/pages/admin/Users';
import JobsAdmin from '@/pages/admin/Jobs';
import CompaniesAdmin from '@/pages/admin/Companies';
import SettingsAdmin from '@/pages/admin/Settings';
import BlogManagement from '@/pages/admin/BlogManagement';
import CreateJob from '@/pages/admin/CreateJob';
import AdminEditJob from '@/pages/admin/EditJob';
import { AdminRoute } from '@/components/AdminRoute';
import SettingsRedirect from '@/components/SettingsRedirect';
import CheckoutSuccess from '@/pages/CheckoutSuccess';
import ResetPassword from '@/pages/ResetPassword';

const App = () => {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/jobs" element={<JobsBrowse />} />
            <Route path="/jobs/:id" element={<JobDetail />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/checkout/success" element={<CheckoutSuccess />} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsRedirect /></ProtectedRoute>} />
            <Route path="/job-seeker" element={<ProtectedRoute><CandidateDashboard /></ProtectedRoute>} />
            <Route path="/job-seeker/jobs" element={<JobsBrowse />} />
            <Route path="/job-seeker/applications" element={<ProtectedRoute><CandidateApplications /></ProtectedRoute>} />
            <Route path="/job-seeker/saved" element={<ProtectedRoute><CandidateSavedJobs /></ProtectedRoute>} />
            <Route path="/job-seeker/messages" element={<ProtectedRoute><CandidateMessages /></ProtectedRoute>} />
            <Route path="/job-seeker/settings" element={<ProtectedRoute><CandidateSettings /></ProtectedRoute>} />

            {/* Job Seeker Routes */}
            <Route path="/account" element={<Account />} />
            
            {/* Candidate Dashboard Routes */}
            <Route path="/candidate" element={<ProtectedRoute><CandidateDashboard /></ProtectedRoute>} />
            <Route path="/candidate/profile" element={<ProtectedRoute><CandidateProfile /></ProtectedRoute>} />
            <Route path="/candidate/applications" element={<ProtectedRoute><CandidateApplications /></ProtectedRoute>} />
            <Route path="/candidate/saved-jobs" element={<ProtectedRoute><CandidateSavedJobs /></ProtectedRoute>} />
            <Route path="/candidate/tailored-resumes" element={<ProtectedRoute><TailoredResumes /></ProtectedRoute>} />
            <Route path="/candidate/messages" element={<ProtectedRoute><CandidateMessages /></ProtectedRoute>} />
            <Route path="/candidate/settings" element={<ProtectedRoute><CandidateSettings /></ProtectedRoute>} />

            {/* Employer Routes */}
            <Route path="/employer" element={<ProtectedEmployerRoute><EmployerDashboard /></ProtectedEmployerRoute>} />
            <Route path="/employer/jobs" element={<ProtectedEmployerRoute><EmployerJobs /></ProtectedEmployerRoute>} />
            <Route path="/employer/jobs/new" element={<ProtectedEmployerRoute><PostJob /></ProtectedEmployerRoute>} />
            <Route path="/employer/jobs/:id/edit" element={<ProtectedEmployerRoute><EditJob /></ProtectedEmployerRoute>} />
            <Route path="/employer/candidates" element={<ProtectedEmployerRoute><Candidates /></ProtectedEmployerRoute>} />
            <Route path="/employer/messages" element={<ProtectedEmployerRoute><EmployerMessages /></ProtectedEmployerRoute>} />
            <Route path="/employer/company" element={<ProtectedEmployerRoute><Company /></ProtectedEmployerRoute>} />
            <Route path="/employer/settings" element={<ProtectedEmployerRoute><EmployerSettings /></ProtectedEmployerRoute>} />
            <Route path="/employer/subscription" element={<ProtectedEmployerRoute><EmployerSubscription /></ProtectedEmployerRoute>} />

            {/* Admin Routes */}
            <Route path="/admin-signin" element={<AdminSignIn />} />
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/users" element={<AdminRoute><UsersAdmin /></AdminRoute>} />
            <Route path="/admin/jobs" element={<AdminRoute><JobsAdmin /></AdminRoute>} />
            <Route path="/admin/jobs/new" element={<AdminRoute><CreateJob /></AdminRoute>} />
            <Route path="/admin/jobs/:id/edit" element={<AdminRoute><AdminEditJob /></AdminRoute>} />
            <Route path="/admin/companies" element={<AdminRoute><CompaniesAdmin /></AdminRoute>} />
            <Route path="/admin/settings" element={<AdminRoute><SettingsAdmin /></AdminRoute>} />
            <Route path="/admin/blog" element={<AdminRoute><BlogManagement /></AdminRoute>} />
            <Route path="/admin/job-scraper" element={<AdminRoute><JobScraper /></AdminRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
};

export default App;
