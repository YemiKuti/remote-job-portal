
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import Account from '@/pages/Account'
import Index from '@/pages/Index'
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
import { AuthProvider } from '@/components/AuthProvider';
import EmployerSubscription from "@/pages/employer/Subscription";

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<AuthComponent />} />
          <Route path="*" element={<NotFound />} />

          {/* Job Seeker Routes */}
          <Route path="/account" element={<Account />} />

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

function AuthComponent() {
  const session = useSession()
  const supabase = useSupabaseClient()

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={['google', 'github']}
          redirectTo={`${window.location.origin}/account`}
        />
      </div>
    </div>
  )
}

export default App;
