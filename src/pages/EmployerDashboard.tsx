
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Eye, Briefcase, BarChart, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { fetchEmployerJobs, fetchEmployerApplications } from '@/utils/api/employerApi';
import { DashboardStatsSkeleton } from '@/components/ui/loading-skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useRetry } from '@/hooks/useRetry';
import { analytics } from '@/utils/analytics';
import { performanceMonitor } from '@/utils/performance';
import ErrorBoundary from '@/components/ErrorBoundary';

const EmployerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { handleError } = useErrorHandler();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalViews: 0,
    totalApplications: 0,
    activeJobs: 0,
    candidatesShortlisted: 0
  });

  // Retry mechanism for data fetching
  const { execute: fetchDataWithRetry } = useRetry(
    async () => {
      if (!user) return;

      const [jobsData, applicationsData] = await Promise.all([
        fetchEmployerJobs(user.id),
        fetchEmployerApplications(user.id)
      ]);

      return { jobsData, applicationsData };
    },
    {
      maxAttempts: 3,
      delay: 1000,
      onError: (error, attempt) => {
        console.warn(`Data fetch attempt ${attempt} failed:`, error);
      }
    }
  );

  useEffect(() => {
    const fetchEmployerData = async () => {
      if (!user) return;

      setLoading(true);
      
      try {
        analytics.trackPageView('employer_dashboard');
        
        const result = await performanceMonitor.measureAsyncTime(
          () => fetchDataWithRetry(),
          'Employer Dashboard Data Fetch'
        );

        if (!result) return;

        const { jobsData, applicationsData } = result;
        
        setJobs(jobsData || []);
        setApplications(applicationsData || []);
        
        // Calculate stats safely
        let totalViews = 0;
        let totalApplications = 0;
        let shortlistedCount = 0;
        
        if (jobsData?.length > 0) {
          totalViews = jobsData.reduce((sum, job) => sum + (job?.views || 0), 0);
        }
        
        if (applicationsData?.length > 0) {
          totalApplications = applicationsData.length;
          shortlistedCount = applicationsData.filter(app => app?.status === 'shortlisted').length;
        }

        setStats({
          totalViews,
          totalApplications,
          activeJobs: jobsData?.filter(job => job?.status === 'active').length || 0,
          candidatesShortlisted: shortlistedCount
        });

        analytics.track('dashboard_loaded', {
          jobsCount: jobsData?.length || 0,
          applicationsCount: applicationsData?.length || 0
        });

      } catch (error) {
        handleError(error, 'Failed to load dashboard data. Please try refreshing the page.');
        analytics.trackError('dashboard_load_failed', { userId: user.id });
      } finally {
        setLoading(false);
      }
    };

    fetchEmployerData();
  }, [user, handleError, fetchDataWithRetry]);

  const handlePostJob = () => {
    analytics.track('post_job_clicked', { source: 'dashboard' });
    navigate('/employer/post-job');
  };

  if (loading) {
    return (
      <DashboardLayout userType="employer">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-48 bg-gray-100 rounded animate-pulse" />
            </div>
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
          </div>
          <DashboardStatsSkeleton />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="h-96 bg-gray-50 rounded-lg animate-pulse" />
            <div className="h-96 bg-gray-50 rounded-lg animate-pulse" />
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <ErrorBoundary>
      <DashboardLayout userType="employer">
        <div className="grid grid-cols-1 gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                Welcome back, {user?.user_metadata?.full_name || user?.user_metadata?.company_name || 'Employer'}!
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage your job postings and track applications
              </p>
            </div>
            <Button 
              className="bg-primary hover:bg-primary/90"
              onClick={handlePostJob}
            >
              Post New Job
            </Button>
          </div>
        
          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalViews > 0 ? `Across ${jobs.length} job${jobs.length !== 1 ? 's' : ''}` : 'Post jobs to get views'}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Applications</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalApplications.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalApplications > 0 ? 'Total applications received' : 'No applications yet'}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeJobs}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.activeJobs > 0 ? 'Currently active jobs' : 'No active jobs'}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Shortlisted</CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.candidatesShortlisted}</div>
                <p className="text-xs text-muted-foreground">Candidates shortlisted</p>
              </CardContent>
            </Card>
          </div>
          
          {/* Recent Activity */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Applications</CardTitle>
                <CardDescription>Recent candidates who applied to your jobs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {applications.length > 0 ? (
                  applications.slice(0, 5).map(app => (
                    <div key={app.id} className="flex items-center justify-between border-b pb-2 last:border-b-0">
                      <div>
                        <p className="font-medium">{app.candidate?.full_name || app.candidate?.username || 'Candidate'}</p>
                        <p className="text-sm text-muted-foreground">
                          {app.job?.title} • Applied on {new Date(app.applied_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">Review</Button>
                        <Button variant="outline" size="sm">Profile</Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState
                    icon={Users}
                    title="No applications yet"
                    description="Post jobs to start receiving applications from candidates."
                    actionLabel="Post a Job"
                    onAction={handlePostJob}
                  />
                )}
                {applications.length > 0 && (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate('/employer/candidates')}
                  >
                    View All Applications
                  </Button>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Your Job Listings</CardTitle>
                <CardDescription>Your active job postings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {jobs.length > 0 ? (
                  jobs.slice(0, 5).map(job => (
                    <div key={job.id} className="flex items-center justify-between border-b pb-2 last:border-b-0">
                      <div>
                        <p className="font-medium">{job.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {job.applications || 0} applications • {job.views || 0} views • 
                          Posted on {new Date(job.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/employer/edit-job/${job.id}`)}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/jobs/${job.id}`)}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState
                    icon={Briefcase}
                    title="No jobs posted yet"
                    description="Create your first job posting to start attracting qualified candidates."
                    actionLabel="Post Your First Job"
                    onAction={handlePostJob}
                  />
                )}
                {jobs.length > 0 && (
                  <Button 
                    variant="outline"
                    className="w-full" 
                    onClick={() => navigate('/employer/jobs')}
                  >
                    View All Jobs
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </ErrorBoundary>
  );
};

export default EmployerDashboard;
