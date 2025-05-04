
import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import JobForm from '@/components/JobForm';
import { useAuth } from '@/components/AuthProvider';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const CreateJob = () => {
  const { user, isLoading } = useAuth();
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [checkingAdmin, setCheckingAdmin] = React.useState(true);

  React.useEffect(() => {
    const checkIfAdmin = async () => {
      if (!user) {
        setCheckingAdmin(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc('is_admin');
        if (error) throw error;
        setIsAdmin(data);
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      } finally {
        setCheckingAdmin(false);
      }
    };

    checkIfAdmin();
  }, [user]);

  // Show loading state while checking authentication and admin status
  if (isLoading || checkingAdmin) {
    return <div>Loading...</div>;
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/auth" />;
  }

  // Redirect to dashboard if not admin
  if (!isAdmin) {
    return <Navigate to="/admin" />;
  }

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Create Job (Admin)</h2>
          <p className="text-muted-foreground">
            Create a new job listing as an administrator.
          </p>
        </div>
        
        <JobForm isAdmin={true} />
      </div>
    </DashboardLayout>
  );
};

export default CreateJob;
