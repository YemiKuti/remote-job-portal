
import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import JobForm from '@/components/JobForm';
import { useParams, Navigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';

const AdminEditJob = () => {
  const { jobId } = useParams();
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
