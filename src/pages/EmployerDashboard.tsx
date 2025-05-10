
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Eye, Briefcase, BarChart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';

const EmployerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
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
        const { data: employerJobs } = await supabase
          .from('jobs')
          .select('*')
          .eq('employer_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);
        
        // For the purpose of this demo, we'll simulate recent applications
        // In real app, you'd fetch from applications table linked to employer's jobs

        let jobsData = employerJobs || [];
        let totalViews = 0;
        let totalApplications = 0;
        
        if (jobsData.length > 0) {
          totalViews = jobsData.reduce((sum, job) => sum + (job.views || 0), 0);
          totalApplications = jobsData.reduce((sum, job) => sum + (job.applications || 0), 0);
          
          // Create simulated recent applications based on employer's jobs
          const simulatedApplications = [];
          
          jobsData.forEach(job => {
            // Generate random applications for each job
            const appCount = job.applications || Math.floor(Math.random() * 5);
            
            for (let i = 0; i < Math.min(appCount, 2); i++) {
              simulatedApplications.push({
                id: `app-${job.id}-${i}`,
                candidate: `Applicant ${Math.floor(Math.random() * 1000)}`,
                position: job.title,
                date: job.created_at ? new Date(new Date(job.created_at).getTime() + i * 86400000).toISOString() : new Date().toISOString(),
                status: i === 0 ? 'pending' : (i === 1 ? 'reviewed' : 'shortlisted')
              });
            }
          });

          setApplications(simulatedApplications.slice(0, 5));
          
          // Simulate candidates based on applications
          setCandidates(simulatedApplications.map((app, index) => ({
            id: `candidate-${index}`,
            name: app.candidate,
            position: app.position,
            status: app.status
          })));
        }

        // Update stats
        setStats({
          totalViews,
          totalApplications,
          activeJobs: jobsData.filter(job => job.status === 'active').length,
          candidatesShortlisted: Math.floor(Math.random() * 10)
        });
        
        setJobs(jobsData);
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-job-green mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your employer dashboard...</p>
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
            className="bg-job-green hover:bg-job-darkGreen"
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
                {stats.totalViews > 0 ? '+15% from last month' : 'Post jobs to get views'}
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
                {stats.totalApplications > 0 ? `+${Math.floor(stats.totalApplications/4)} this week` : 'No applications yet'}
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
              <p className="text-xs text-muted-foreground">Job postings</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Shortlisted</CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.candidatesShortlisted}</div>
              <p className="text-xs text-muted-foreground">Candidates</p>
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
                applications.map(app => (
                  <div key={app.id} className="flex items-center justify-between border-b pb-2 last:border-b-0">
                    <div>
                      <p className="font-medium">{app.candidate}</p>
                      <p className="text-sm text-muted-foreground">
                        {app.position} • Applied on {new Date(app.date).toLocaleDateString()}
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
                <Button variant="outline" className="w-full">View All Applications</Button>
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
                jobs.map(job => (
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
                  className="w-full" 
                  onClick={() => navigate('/employer/post-job')}
                >
                  Post New Job
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Candidate Management</CardTitle>
            <CardDescription>Manage applications across all your job postings</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="shortlisted">Shortlisted</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="space-y-4">
                {candidates.length > 0 ? (
                  <div className="relative overflow-x-auto rounded-md border">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50 text-xs uppercase">
                        <tr>
                          <th scope="col" className="px-6 py-3">Candidate</th>
                          <th scope="col" className="px-6 py-3">Job Position</th>
                          <th scope="col" className="px-6 py-3">Applied Date</th>
                          <th scope="col" className="px-6 py-3">Status</th>
                          <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {candidates.map((candidate, i) => (
                          <tr key={candidate.id} className="bg-white border-b">
                            <td className="px-6 py-4 font-medium">{candidate.name}</td>
                            <td className="px-6 py-4">{candidate.position}</td>
                            <td className="px-6 py-4">{new Date().toLocaleDateString()}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                candidate.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                candidate.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                                candidate.status === 'shortlisted' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {candidate.status.charAt(0).toUpperCase() + candidate.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex space-x-2">
                                <Button size="sm" variant="outline">View</Button>
                                <Button size="sm" variant="outline">Contact</Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No candidates have applied to your jobs yet.</p>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="pending">
                <div className="text-center py-6">
                  <p className="text-muted-foreground">Pending applications will appear here.</p>
                </div>
              </TabsContent>
              <TabsContent value="shortlisted">
                <div className="text-center py-6">
                  <p className="text-muted-foreground">Shortlisted candidates will appear here.</p>
                </div>
              </TabsContent>
              <TabsContent value="rejected">
                <div className="text-center py-6">
                  <p className="text-muted-foreground">Rejected applications will appear here.</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default EmployerDashboard;
