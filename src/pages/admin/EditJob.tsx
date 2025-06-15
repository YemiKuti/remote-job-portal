
import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import JobForm from '@/components/JobForm';
import { useParams } from 'react-router-dom';

const AdminEditJob = () => {
  // Use "id" from route params, since the route is "/admin/jobs/:id/edit"
  const { id } = useParams();

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Edit Job (Admin)</h2>
          <p className="text-muted-foreground">
            Edit job details as an administrator. You can change any job details and update its status.
          </p>
        </div>
        
        <JobForm jobId={id} isAdmin={true} />
      </div>
    </DashboardLayout>
  );
};

export default AdminEditJob;

