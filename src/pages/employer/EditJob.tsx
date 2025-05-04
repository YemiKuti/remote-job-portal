
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import JobForm from '@/components/JobForm';
import { useAuth } from '@/components/AuthProvider';
import { Navigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const EditJob = () => {
  const { jobId } = useParams();
  const { user, isLoading } = useAuth();
  const [canEdit, setCanEdit] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const checkJobAccess = async () => {
      if (!user || !jobId) {
        setCheckingAccess(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('jobs')
          .select('employer_id')
          .eq('id', jobId)
          .single();
        
        if (error) throw error;
        
        // Check if the job belongs to the current user
        if (data.employer_id === user.id) {
          setCanEdit(true);
        } else {
          toast({
            title: "Access Denied",
            description: "You don't have permission to edit this job.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error checking job access:", error);
        toast({
          title: "Error",
          description: "Failed to load job details.",
          variant: "destructive",
        });
      } finally {
        setCheckingAccess(false);
      }
    };

    checkJobAccess();
  }, [jobId, user, toast]);

  // Show loading state while checking authentication and job access
  if (isLoading || checkingAccess) {
    return <div>Loading...</div>;
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/auth" />;
  }

  // Redirect to jobs list if user doesn't have permission to edit this job
  if (!canEdit) {
    return <Navigate to="/employer/jobs" />;
  }

  return (
    <DashboardLayout userType="employer">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Edit Job</h2>
          <p className="text-muted-foreground">
            Update your job listing details.
          </p>
        </div>
        
        <JobForm jobId={jobId} />
      </div>
    </DashboardLayout>
  );
};

export default EditJob;
