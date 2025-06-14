import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { QueryClient } from 'react-query';

import Home from './pages/Home';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import Signin from './pages/Signin';
import Signup from './pages/Signup';
import Pricing from './pages/Pricing';
import About from './pages/About';
import Contact from './pages/Contact';
import Blog from './pages/Blog';
import PostDetail from './pages/PostDetail';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import NotFound from './pages/NotFound';

import EmployerDashboard from './pages/employer/Dashboard';
import EmployerJobs from './pages/employer/Jobs';
import EmployerNewJob from './pages/employer/NewJob';
import EmployerEditJob from './pages/employer/EditJob';
import EmployerApplications from './pages/employer/Applications';
import EmployerProfile from './pages/employer/Profile';
import EmployerMessages from './pages/employer/Messages';
import EmployerSettings from './pages/employer/Settings';

import AdminDashboard from './pages/admin/Dashboard';
import AdminJobs from './pages/admin/Jobs';
import AdminCompanies from './pages/admin/Companies';
import AdminUsers from './pages/admin/Users';
import AdminSettings from './pages/admin/Settings';
import AdminJobDetail from './pages/admin/JobDetail';
import AdminCompanyDetail from './pages/admin/CompanyDetail';
import AdminUserDetail from './pages/admin/UserDetail';
import AdminNewCompany from './pages/admin/NewCompany';
import AdminEditCompany from './pages/admin/EditCompany';
import AdminNewJob from './pages/admin/NewJob';
import AdminEditJob from './pages/admin/EditJob';
import AdminNewUser from './pages/admin/NewUser';
import AdminEditUser from './pages/admin/EditUser';

import CandidateProfile from './pages/candidate/Profile';
import CandidateApplications from './pages/candidate/Applications';
import CandidateSavedJobs from './pages/candidate/SavedJobs';
import CandidateMessages from './pages/candidate/Messages';
import CandidateSettings from './pages/candidate/Settings';
import TailoredResumes from "@/pages/candidate/TailoredResumes";

import { AuthProvider } from './components/AuthProvider';

function App() {
  return (
    <QueryClient>
      <BrowserRouter>
        <AuthProvider>
          <Toaster />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/:id" element={<JobDetail />} />
            <Route path="/signin" element={<Signin />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<PostDetail />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="*" element={<NotFound />} />

            {/* Employer Routes */}
            <Route path="/employer" element={<EmployerDashboard />} />
            <Route path="/employer/jobs" element={<EmployerJobs />} />
            <Route path="/employer/jobs/new" element={<EmployerNewJob />} />
            <Route path="/employer/jobs/:id/edit" element={<EmployerEditJob />} />
            <Route path="/employer/applications" element={<EmployerApplications />} />
            <Route path="/employer/profile" element={<EmployerProfile />} />
            <Route path="/employer/messages" element={<EmployerMessages />} />
            <Route path="/employer/settings" element={<EmployerSettings />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/jobs" element={<AdminJobs />} />
            <Route path="/admin/jobs/:id" element={<AdminJobDetail />} />
            <Route path="/admin/companies" element={<AdminCompanies />} />
            <Route path="/admin/companies/new" element={<AdminNewCompany />} />
            <Route path="/admin/companies/:id" element={<AdminCompanyDetail />} />
            <Route path="/admin/companies/:id/edit" element={<AdminEditCompany />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/users/new" element={<AdminNewUser />} />
            <Route path="/admin/users/:id" element={<AdminUserDetail />} />
            <Route path="/admin/users/:id/edit" element={<AdminEditUser />} />
            <Route path="/admin/jobs/new" element={<AdminNewJob />} />
            <Route path="/admin/jobs/:id/edit" element={<AdminEditJob />} />
            <Route path="/admin/settings" element={<AdminSettings />} />

            {/* Candidate Routes */}
            <Route path="/candidate/profile" element={<CandidateProfile />} />
            <Route path="/candidate/applications" element={<CandidateApplications />} />
            <Route path="/candidate/saved-jobs" element={<CandidateSavedJobs />} />
            <Route path="/candidate/tailored-resumes" element={<TailoredResumes />} />
            <Route path="/candidate/messages" element={<CandidateMessages />} />
            <Route path="/candidate/settings" element={<CandidateSettings />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClient>
  );
}

export default App;
