
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { Loader2 } from 'lucide-react';

const SettingsRedirect = () => {
  const { user } = useAuth();
  const { isAdmin, adminVerified, verifyAdminStatus } = useSecureAuth();

  useEffect(() => {
    if (user && !adminVerified) {
      verifyAdminStatus();
    }
  }, [user, adminVerified, verifyAdminStatus]);

  // Show loading while verifying admin status
  if (user && !adminVerified) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Redirect based on user role
  if (isAdmin) {
    return <Navigate to="/admin/settings" replace />;
  }

  // Check if user is an employer (has employer role or is accessing from employer context)
  const userRole = user?.user_metadata?.role;
  if (userRole === 'employer') {
    return <Navigate to="/employer/settings" replace />;
  }

  // Default to candidate settings
  return <Navigate to="/candidate/settings" replace />;
};

export default SettingsRedirect;
