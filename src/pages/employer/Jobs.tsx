
import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEmployerJobs } from '@/hooks/employer/useEmployerJobs';
import { JobsHeader } from '@/components/employer/jobs/JobsHeader';
import { JobsSearch } from '@/components/employer/jobs/JobsSearch';
import { JobsTabContent } from '@/components/employer/jobs/JobsTabContent';
import { EmptyJobsState } from '@/components/employer/EmptyJobsState';
import { TableSkeleton } from '@/components/ui/loading-skeleton';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import ErrorBoundary from '@/components/ErrorBoundary';
import { analytics } from '@/utils/analytics';
import { useEffect } from 'react';

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

  const { handleError } = useErrorHandler();

  useEffect(() => {
    analytics.trackPageView('employer_jobs');
  }, []);

  const enhancedHandleJobAction = async (jobId: string, action: string) => {
    try {
      analytics.track('job_action_attempted', { jobId, action });
      await handleJobAction(jobId, action);
      analytics.track('job_action_completed', { jobId, action });
    } catch (error) {
      handleError(error, `Failed to ${action} job. Please try again.`);
      analytics.trackError('job_action_failed', { jobId, action, error: error.message });
    }
  };
  
  return (
    <ErrorBoundary>
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
                  <TabsTrigger value="active">
                    Active ({activeJobs.length})
                  </TabsTrigger>
                  <TabsTrigger value="pending">
                    Pending ({pendingJobs.length})
                  </TabsTrigger>
                  <TabsTrigger value="draft">
                    Draft ({draftJobs.length})
                  </TabsTrigger>
                  <TabsTrigger value="closed">
                    Closed ({closedJobs.length})
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="active" className="space-y-4 pt-4">
                  {loading ? (
                    <TableSkeleton rows={5} columns={4} />
                  ) : activeJobs.length > 0 ? (
                    <JobsTabContent 
                      jobs={activeJobs}
                      loading={loading}
                      emptyMessage="No active jobs found."
                      onJobAction={enhancedHandleJobAction}
                      showViewApplicants={true}
                    />
                  ) : (
                    <EmptyJobsState type="active" />
                  )}
                </TabsContent>
                
                <TabsContent value="pending" className="space-y-4 pt-4">
                  {loading ? (
                    <TableSkeleton rows={3} columns={4} />
                  ) : pendingJobs.length > 0 ? (
                    <JobsTabContent 
                      jobs={pendingJobs}
                      loading={loading}
                      emptyMessage="No pending approval jobs found."
                      onJobAction={enhancedHandleJobAction}
                      showViewApplicants={false}
                    />
                  ) : (
                    <EmptyJobsState type="pending" />
                  )}
                </TabsContent>
                
                <TabsContent value="draft" className="space-y-4 pt-4">
                  {loading ? (
                    <TableSkeleton rows={2} columns={4} />
                  ) : draftJobs.length > 0 ? (
                    <JobsTabContent 
                      jobs={draftJobs}
                      loading={loading}
                      emptyMessage="No draft jobs found."
                      onJobAction={enhancedHandleJobAction}
                      showPublishButton={true}
                      showDeleteButton={true}
                      showViewApplicants={false}
                    />
                  ) : (
                    <EmptyJobsState type="draft" />
                  )}
                </TabsContent>
                
                <TabsContent value="closed" className="space-y-4 pt-4">
                  {loading ? (
                    <TableSkeleton rows={3} columns={4} />
                  ) : closedJobs.length > 0 ? (
                    <JobsTabContent 
                      jobs={closedJobs}
                      loading={loading}
                      emptyMessage="No closed jobs found."
                      onJobAction={enhancedHandleJobAction}
                      showReactivateButton={true}
                    />
                  ) : (
                    <EmptyJobsState type="closed" />
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ErrorBoundary>
  );
};

export default EmployerJobs;
