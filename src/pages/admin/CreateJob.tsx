
import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import JobForm from '@/components/JobForm';
import { useAuth } from '@/components/AuthProvider';
import { Navigate } from 'react-router-dom';

const CreateJob = () => {
  const { user, isLoading } = useAuth();
  
  // Show loading state while checking authentication
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/auth" />;
  }

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Create Job (Admin)</h2>
          <p className="text-muted-foreground">
            Create a new job listing as an administrator. Jobs created by admins can be immediately published.
          </p>
        </div>
        
        <JobForm isAdmin={true} />
      </div>
    </DashboardLayout>
  );
};

export default CreateJob;
