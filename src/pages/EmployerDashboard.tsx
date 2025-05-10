import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Eye, Briefcase, BarChart, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { fetchEmployerJobs, fetchEmployerApplications } from '@/utils/api/employerApi';

const EmployerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalViews: 0,
    totalApplications: 0,
    activeJobs: 0,
    candidatesShortlisted: 0
  });

  useEffect(() => {
    const fetchEmployerData = async () => {
      if (!user) return;

      setLoading(true);
      try {
        // Fetch employer's job postings
        const jobsData = await fetchEmployerJobs(user.id);
        setJobs(jobsData);
        
        // Fetch applications for employer's jobs
        const applicationsData = await fetchEmployerApplications(user.id);
        setApplications(applicationsData);
        
        // Calculate stats
        let totalViews = 0;
        let totalApplications = 0;
        let shortlistedCount = 0;
        
        if (jobsData.length > 0) {
          totalViews = jobsData.reduce((sum, job) => sum + (job.views || 0), 0);
        }
        
        if (applicationsData.length > 0) {
          totalApplications = applicationsData.length;
          // Use optional chaining to safely access status
          shortlistedCount = applicationsData.filter(app => app?.status === 'shortlisted').length;
        }

        // Update stats
        setStats({
          totalViews,
          totalApplications,
          activeJobs: jobsData.filter(job => job?.status === 'active').length,
          candidatesShortlisted: shortlistedCount
        });
      } catch (error) {
        console.error("Error fetching employer data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployerData();
  }, [user]);

  if (loading) {
    return (
      <DashboardLayout userType="employer">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Loader2 className="animate-spin h-12 w-12 mx-auto text-primary" />
            <p className="mt-4 text-muted-foreground">Loading your employer dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout userType="employer">
      <div className="grid grid-cols-1 gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            Welcome back, {user?.user_metadata?.full_name || user?.user_metadata?.company_name || 'Employer'}!
          </h1>
          <Button 
            className="bg-primary hover:bg-primary/90"
            onClick={() => navigate('/employer/post-job')}
          >
            Post New Job
          </Button>
        </div>
      
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalViews}</div>
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
              <div className="text-2xl font-bold">{stats.totalApplications}</div>
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
                      <Button size="sm">Review</Button>
                      <Button variant="outline" size="sm">Profile</Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No applications yet. Post jobs to receive applications.</p>
                </div>
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
                <div className="text-center py-6">
                  <p className="text-muted-foreground">You haven't posted any jobs yet.</p>
                  <Button 
                    className="mt-2"
                    onClick={() => navigate('/employer/post-job')}
                  >
                    Post Your First Job
                  </Button>
                </div>
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
  );
};

export default EmployerDashboard;
