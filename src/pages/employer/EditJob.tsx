
import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import JobForm from '@/components/JobForm';
import { useParams } from 'react-router-dom';

const EditJob = () => {
  const { id: jobId } = useParams<{ id: string }>();

  return (
    <DashboardLayout userType="employer">
      <div className="space-y-6 max-w-2xl mx-auto">
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
