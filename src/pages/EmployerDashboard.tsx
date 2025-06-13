import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Eye, Briefcase, BarChart, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { fetchEmployerJobs, fetchEmployerApplications } from '@/utils/api/employerApi';
import { DashboardStatsSkeleton } from '@/components/ui/loading-skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { analytics } from '@/utils/analytics';
import ErrorBoundary from '@/components/ErrorBoundary';
import { ProtectedEmployerRoute } from '@/components/employer/ProtectedEmployerRoute';
import { StartConversationButton } from '@/components/messaging/StartConversationButton';

const EmployerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { handleError } = useErrorHandler();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const hasFetchedRef = useRef(false);

  // Memoize stats calculation to prevent unnecessary recalculations
  const stats = useMemo(() => {
    let totalViews = 0;
    let totalApplications = 0;
    let shortlistedCount = 0;
    
    if (jobs?.length > 0) {
      totalViews = jobs.reduce((sum, job) => sum + (job?.views || 0), 0);
    }
    
    if (applications?.length > 0) {
      totalApplications = applications.length;
      shortlistedCount = applications.filter(app => app?.status === 'shortlisted').length;
    }

    return {
      totalViews,
      totalApplications,
      activeJobs: jobs?.filter(job => job?.status === 'active').length || 0,
      candidatesShortlisted: shortlistedCount
    };
  }, [jobs, applications]);

  // Stable data fetching function with improved error handling
  const fetchData = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      setError(null);
      setDebugInfo('');
      
      console.log('🔄 EmployerDashboard: Fetching data for user:', userId);
      
      // Add debug info
      setDebugInfo(`Attempting to fetch data for user: ${userId}`);
      
      const [jobsData, applicationsData] = await Promise.allSettled([
        fetchEmployerJobs(userId),
        fetchEmployerApplications(userId)
      ]);
      
      // Handle jobs data
      if (jobsData.status === 'fulfilled') {
        console.log('✅ Jobs fetched successfully:', jobsData.value?.length || 0);
        setJobs(jobsData.value || []);
      } else {
        console.error('❌ Jobs fetch failed:', jobsData.reason);
        setJobs([]);
        
        // Check if it's a permission error
        if (jobsData.reason?.message?.includes('permission denied') || 
            jobsData.reason?.message?.includes('access denied')) {
          setDebugInfo(`Permission denied accessing jobs. User ID: ${userId}. This might indicate missing database permissions.`);
        } else {
          setDebugInfo(`Error fetching jobs: ${jobsData.reason?.message || 'Unknown error'}`);
        }
      }
      
      // Handle applications data
      if (applicationsData.status === 'fulfilled') {
        console.log('✅ Applications fetched successfully:', applicationsData.value?.length || 0);
        setApplications(applicationsData.value || []);
      } else {
        console.error('❌ Applications fetch failed:', applicationsData.reason);
        setApplications([]);
      }
      
      console.log('✅ EmployerDashboard: Data fetch completed', { 
        jobs: jobsData.status === 'fulfilled' ? jobsData.value?.length || 0 : 0, 
        applications: applicationsData.status === 'fulfilled' ? applicationsData.value?.length || 0 : 0 
      });
      
      hasFetchedRef.current = true;
      
      // Only set error if both failed
      if (jobsData.status === 'rejected' && applicationsData.status === 'rejected') {
        setError('Failed to load dashboard data. Please check your permissions and try again.');
      }
      
    } catch (error: any) {
      console.error('❌ EmployerDashboard: Error fetching data:', error);
      
      // Handle authentication errors specifically
      if (error.message?.includes('auth') || error.code === 'PGRST301') {
        setError('Authentication required. Please log in to access your dashboard.');
        setDebugInfo('Authentication error detected. Redirecting to login...');
        navigate('/auth?role=employer');
        return;
      }
      
      setError('Failed to load dashboard data. Please try refreshing the page.');
      setDebugInfo(`Fetch error: ${error.message || 'Unknown error'}`);
      handleError(error, 'Failed to load dashboard data. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  }, [handleError, navigate]);

  // Single effect for initial data fetch
  useEffect(() => {
    if (user?.id && !hasFetchedRef.current) {
      analytics.trackPageView('employer_dashboard');
      fetchData(user.id);
    }
  }, [user?.id, fetchData]);

  const handlePostJob = useCallback(() => {
    analytics.track('post_job_clicked', { source: 'dashboard' });
    navigate('/employer/post-job');
  }, [navigate]);

  const handleRetry = useCallback(() => {
    if (user?.id) {
      hasFetchedRef.current = false;
      setError(null);
      setDebugInfo('');
      fetchData(user.id);
    }
  }, [user?.id, fetchData]);

  const handleViewApplication = useCallback((applicationId: string) => {
    analytics.track('application_reviewed', { source: 'dashboard', applicationId });
    navigate('/employer/candidates', { state: { focusApplicationId: applicationId } });
  }, [navigate]);

  const handleViewCandidateProfile = useCallback((candidateId: string, candidateName: string) => {
    if (!candidateId) {
      console.warn('Cannot view profile: candidate ID is missing');
      return;
    }
    analytics.track('candidate_profile_viewed', { source: 'dashboard', candidateId });
    // Navigate to a candidate profile view (we'll need to create this route later)
    // For now, navigate to candidates page
    navigate('/employer/candidates', { state: { focusCandidateId: candidateId } });
  }, [navigate]);

  // Show error state with debug info
  if (error && !loading && jobs.length === 0 && applications.length === 0) {
    return (
      <ProtectedEmployerRoute>
        <DashboardLayout userType="employer">
          <div className="flex items-center justify-center min-h-[400px]">
            <Card className="w-full max-w-2xl">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Unable to load dashboard</h3>
                    <p className="text-muted-foreground mt-1">{error}</p>
                    {debugInfo && (
                      <details className="mt-4 text-left">
                        <summary className="cursor-pointer text-sm text-gray-500">Debug Information</summary>
                        <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                          {debugInfo}
                        </pre>
                      </details>
                    )}
                  </div>
                  <Button onClick={handleRetry} className="w-full">
                    Try Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </DashboardLayout>
      </ProtectedEmployerRoute>
    );
  }

  // Show loading state consistently
  if (loading && jobs.length === 0 && applications.length === 0) {
    return (
      <ProtectedEmployerRoute>
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
      </ProtectedEmployerRoute>
    );
  }
  
  return (
    <ErrorBoundary>
      <ProtectedEmployerRoute>
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
                {debugInfo && (
                  <p className="text-xs text-gray-500 mt-1">Debug: {debugInfo}</p>
                )}
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
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewApplication(app.id)}
                          >
                            Review
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewCandidateProfile(app.user_id, app.candidate?.full_name || app.candidate?.username || 'Candidate')}
                            disabled={!app.user_id}
                          >
                            Profile
                          </Button>
                          {app.user_id && (
                            <StartConversationButton
                              recipientId={app.user_id}
                              recipientName={app.candidate?.full_name || app.candidate?.username || 'Candidate'}
                              currentUserRole="employer"
                              variant="outline"
                              size="sm"
                            >
                              Message
                            </StartConversationButton>
                          )}
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
      </ProtectedEmployerRoute>
    </ErrorBoundary>
  );
};

export default EmployerDashboard;
