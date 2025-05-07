
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import JobForm from '@/components/JobForm';
import { useAuth } from '@/components/AuthProvider';
import { Navigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AdminEditJob = () => {
  const { jobId } = useParams();
  const { user, isLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
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
        toast({
          title: "Access Denied",
          description: "You don't have administrator privileges.",
          variant: "destructive",
        });
        setIsAdmin(false);
      } finally {
        setCheckingAdmin(false);
      }
    };

    checkIfAdmin();
  }, [user, toast]);

  // Show loading state while checking authentication and admin status
  if (isLoading || checkingAdmin) {
    return <div>Loading...</div>;
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/auth" />;
  }

  // Redirect to admin dashboard if not admin
  if (!isAdmin) {
    return <Navigate to="/admin" />;
  }

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Edit Job (Admin)</h2>
          <p className="text-muted-foreground">
            Edit job details as an administrator. You can change any job details and update its status.
          </p>
        </div>
        
        <JobForm jobId={jobId} isAdmin={true} />
      </div>
    </DashboardLayout>
  );
};

export default AdminEditJob;
