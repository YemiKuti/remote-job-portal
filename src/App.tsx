
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Account from '@/pages/Account'
import Index from '@/pages/Index'
import Pricing from '@/pages/Pricing'
import AuthPage from '@/pages/Auth'
import JobsBrowse from '@/pages/JobsBrowse'
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

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/jobs" element={<JobsBrowse />} />
          <Route path="/job-seeker/jobs" element={<JobsBrowse />} />
          <Route path="/job-seeker/applications" element={<ProtectedRoute><CandidateApplications /></ProtectedRoute>} />
          <Route path="/job-seeker/saved" element={<ProtectedRoute><CandidateSavedJobs /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />

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
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
