
import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import JobForm from '@/components/JobForm';

const CreateJob = () => {
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
