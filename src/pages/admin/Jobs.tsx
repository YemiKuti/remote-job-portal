
import React from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { JobsHeader } from "@/components/admin/jobs/JobsHeader";
import { JobsFilter } from "@/components/admin/jobs/JobsFilter";
import { JobsTable } from "@/components/admin/jobs/JobsTable";
import { useJobsManagement } from "@/hooks/admin/useJobsManagement";

const JobsAdmin = () => {
  const { jobs, loading, searchTerm, setSearchTerm, handleJobAction } = useJobsManagement();

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        <JobsHeader />
        <JobsFilter searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>All Jobs</CardTitle>
            <CardDescription>Showing all job listings</CardDescription>
          </CardHeader>
          <CardContent>
            <JobsTable 
              jobs={jobs} 
              loading={loading} 
              onJobAction={handleJobAction} 
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default JobsAdmin;
