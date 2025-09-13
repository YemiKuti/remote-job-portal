
import React, { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { JobsTable } from '@/components/admin/jobs/JobsTable';
import { JobsFilter } from '@/components/admin/jobs/JobsFilter';
import { JobsHeader } from '@/components/admin/jobs/JobsHeader';
import { JobApprovalPanel } from '@/components/admin/jobs/JobApprovalPanel';
import { useJobsManagement } from "@/hooks/admin/useJobsManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, List } from "lucide-react";

const JobsAdmin = () => {
  const { jobs, loading, searchTerm, setSearchTerm, handleJobAction, reloadJobs } = useJobsManagement();

  // Separate pending and approved jobs
  const pendingJobs = jobs.filter(job => job.status === 'pending' || job.status === 'draft');
  const approvedJobs = jobs.filter(job => job.status !== 'pending' && job.status !== 'draft');

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        <JobsHeader onJobsUploaded={reloadJobs} />
        
        <Tabs defaultValue="approval" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="approval" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Approval Queue
              {pendingJobs.length > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {pendingJobs.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="all" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              All Jobs
              <Badge variant="secondary" className="ml-1">
                {jobs.length}
              </Badge>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="approval" className="space-y-4">
            <JobApprovalPanel onJobsUpdated={reloadJobs} />
          </TabsContent>
          
          <TabsContent value="all" className="space-y-4">
            <JobsFilter searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            <JobsTable 
              jobs={jobs} 
              loading={loading} 
              onJobAction={handleJobAction} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default JobsAdmin;
