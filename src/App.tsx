import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import Account from '@/pages/Account'
import Home from '@/pages/Home';
import Jobs from '@/pages/Jobs';
import JobDetail from '@/pages/JobDetail';
import PostJob from '@/pages/PostJob';
import EditJob from '@/pages/EditJob';
import EmployerDashboard from '@/pages/EmployerDashboard';
import EmployerJobs from '@/pages/employer/Jobs';
import Candidates from '@/pages/Candidates';
import EmployerMessages from '@/pages/employer/Messages';
import Company from '@/pages/employer/Company';
import EmployerSettings from '@/pages/employer/Settings';
import Pricing from '@/pages/Pricing';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import Terms from '@/pages/Terms';
import Privacy from '@/pages/Privacy';
import CookiePolicy from '@/pages/CookiePolicy';
import NotFound from '@/pages/NotFound';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ProtectedEmployerRoute } from '@/components/ProtectedEmployerRoute';
import { AuthProvider } from '@/components/AuthProvider';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import EmployerSubscription from "@/pages/employer/Subscription";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/cookie-policy" element={<CookiePolicy />} />
          <Route path="/auth" element={<AuthComponent />} />
          <Route path="*" element={<NotFound />} />

          {/* Job Seeker Routes */}
          <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />

          {/* Employer Routes */}
          <Route path="/employer" element={<ProtectedEmployerRoute />}>
            <Route index element={<EmployerDashboard />} />
            <Route path="jobs" element={<EmployerJobs />} />
            <Route path="jobs/new" element={<PostJob />} />
            <Route path="jobs/:id/edit" element={<EditJob />} />
            <Route path="candidates" element={<Candidates />} />
            <Route path="messages" element={<EmployerMessages />} />
            <Route path="company" element={<Company />} />
            <Route path="settings" element={<EmployerSettings />} />
            <Route path="subscription" element={<EmployerSubscription />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
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
          session={session}
          providers={['google', 'github']}
          redirectTo={`${window.location.origin}/account`}
        />
      </div>
    </div>
  )
}

export default App;
