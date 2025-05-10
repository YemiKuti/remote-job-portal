
import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEmployerJobs } from '@/hooks/employer/useEmployerJobs';
import { JobsHeader } from '@/components/employer/jobs/JobsHeader';
import { JobsSearch } from '@/components/employer/jobs/JobsSearch';
import { JobsTabContent } from '@/components/employer/jobs/JobsTabContent';

const EmployerJobs = () => {
  const { 
    activeJobs, 
    draftJobs, 
    pendingJobs, 
    closedJobs, 
    loading, 
    searchTerm, 
    setSearchTerm, 
    handleJobAction 
  } = useEmployerJobs();
  
  return (
    <DashboardLayout userType="employer">
      <div className="space-y-6">
        <JobsHeader />
        
        <JobsSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        
        <Card>
          <CardHeader>
            <CardTitle>All Job Postings</CardTitle>
            <CardDescription>View and manage all your job listings</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="active">
              <TabsList>
                <TabsTrigger value="active">Active ({activeJobs.length})</TabsTrigger>
                <TabsTrigger value="pending">Pending ({pendingJobs.length})</TabsTrigger>
                <TabsTrigger value="draft">Draft ({draftJobs.length})</TabsTrigger>
                <TabsTrigger value="closed">Closed ({closedJobs.length})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="active" className="space-y-4 pt-4">
                <JobsTabContent 
                  jobs={activeJobs}
                  loading={loading}
                  emptyMessage="No active jobs found."
                  onJobAction={handleJobAction}
                  showViewApplicants={true}
                />
              </TabsContent>
              
              <TabsContent value="pending" className="space-y-4 pt-4">
                <JobsTabContent 
                  jobs={pendingJobs}
                  loading={loading}
                  emptyMessage="No pending approval jobs found."
                  onJobAction={handleJobAction}
                  showViewApplicants={false}
                />
              </TabsContent>
              
              <TabsContent value="draft" className="space-y-4 pt-4">
                <JobsTabContent 
                  jobs={draftJobs}
                  loading={loading}
                  emptyMessage="No draft jobs found."
                  onJobAction={handleJobAction}
                  showPublishButton={true}
                  showDeleteButton={true}
                  showViewApplicants={false}
                />
              </TabsContent>
              
              <TabsContent value="closed" className="space-y-4 pt-4">
                <JobsTabContent 
                  jobs={closedJobs}
                  loading={loading}
                  emptyMessage="No closed jobs found."
                  onJobAction={handleJobAction}
                  showReactivateButton={true}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default EmployerJobs;
