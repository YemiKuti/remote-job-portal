
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Briefcase, Building, Star } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';

const CandidateDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userApplications, setUserApplications] = useState([]);
  const [userSavedJobs, setUserSavedJobs] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [stats, setStats] = useState({
    profileViews: 0,
    totalApplications: 0,
    savedJobs: 0,
    followedCompanies: 0
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      setLoading(true);
      try {
        // Fetch user applications (simulated with jobs data)
        const { data: applications } = await supabase
          .from('jobs')
          .select('*')
          .limit(3);
          
        // Fetch saved jobs (simulated)
        const { data: savedJobs } = await supabase
          .from('jobs')
          .select('*')
          .limit(2);
        
        // Fetch recommended jobs based on skills (simulated)
        const { data: recommended } = await supabase
          .from('jobs')
          .select('*')
          .limit(3);

        // Update state with real data
        if (applications) {
          setUserApplications(applications.map(job => ({
            id: job.id,
            position: job.title,
            company: job.company,
            date: job.created_at,
            status: Math.random() > 0.5 ? 'pending' : (Math.random() > 0.5 ? 'reviewed' : 'rejected')
          })));
          
          setStats(prev => ({
            ...prev, 
            totalApplications: applications.length,
            profileViews: Math.floor(Math.random() * 50) + 10
          }));
        }
        
        if (savedJobs) {
          setUserSavedJobs(savedJobs.map(job => ({
            id: job.id,
            position: job.title,
            company: job.company,
            location: job.location,
            savedDate: job.created_at
          })));
          
          setStats(prev => ({
            ...prev, 
            savedJobs: savedJobs.length,
            followedCompanies: Math.floor(Math.random() * 8) + 1
          }));
        }
        
        if (recommended) {
          setRecommendedJobs(recommended);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  if (loading) {
    return (
      <DashboardLayout userType="candidate">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-job-green mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout userType="candidate">
      <div className="grid grid-cols-1 gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            Welcome back, {user?.user_metadata?.full_name || 'Job Seeker'}!
          </h1>
          <Button className="bg-job-green hover:bg-job-darkGreen">
            Find New Jobs
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
              <Search className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.profileViews}</div>
              <p className="text-xs text-muted-foreground">+20% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Applications</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalApplications}</div>
              <p className="text-xs text-muted-foreground">+2 this week</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Saved Jobs</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.savedJobs}</div>
              <p className="text-xs text-muted-foreground">Save jobs for later</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Following</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.followedCompanies}</div>
              <p className="text-xs text-muted-foreground">Companies you follow</p>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Applications</CardTitle>
              <CardDescription>Your recent job applications and their status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {userApplications.length > 0 ? (
                userApplications.map(app => (
                  <div key={app.id} className="flex items-center justify-between border-b pb-2 last:border-b-0">
                    <div>
                      <p className="font-medium">{app.position}</p>
                      <p className="text-sm text-muted-foreground">
                        {app.company} • Applied on {new Date(app.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        app.status === 'reviewed' ? 'bg-blue-100 text-blue-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">You haven't applied to any jobs yet.</p>
                  <Button variant="outline" className="mt-2">Browse Jobs</Button>
                </div>
              )}
              {userApplications.length > 0 && (
                <Button variant="outline" className="w-full">View All Applications</Button>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Saved Jobs</CardTitle>
              <CardDescription>Jobs you saved for later</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {userSavedJobs.length > 0 ? (
                userSavedJobs.map(job => (
                  <div key={job.id} className="flex items-center justify-between border-b pb-2 last:border-b-0">
                    <div>
                      <p className="font-medium">{job.position}</p>
                      <p className="text-sm text-muted-foreground">{job.company} • {job.location}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">Apply</Button>
                      <Button variant="ghost" size="sm">Remove</Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">You haven't saved any jobs yet.</p>
                  <Button variant="outline" className="mt-2">Find Jobs</Button>
                </div>
              )}
              {userSavedJobs.length > 0 && (
                <Button variant="outline" className="w-full">View All Saved Jobs</Button>
              )}
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Recommended Jobs</CardTitle>
            <CardDescription>Based on your profile and preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="new">New</TabsTrigger>
                <TabsTrigger value="recommended">Recommended</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="space-y-4">
                {recommendedJobs.length > 0 ? (
                  recommendedJobs.map(job => (
                    <div key={job.id} className="flex items-center justify-between border-b pb-4 last:border-b-0">
                      <div>
                        <p className="font-medium">{job.title}</p>
                        <p className="text-sm text-muted-foreground">{job.company} • {job.location}</p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {job.tech_stack && job.tech_stack.slice(0, 3).map((tech, i) => (
                            <span key={i} className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button>Apply Now</Button>
                        <Button variant="outline">Save</Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No recommended jobs available right now.</p>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="new">
                <div className="text-center py-6">
                  <p className="text-muted-foreground">New jobs matching your profile will appear here.</p>
                </div>
              </TabsContent>
              <TabsContent value="recommended">
                <div className="text-center py-6">
                  <p className="text-muted-foreground">Recommended jobs based on your profile will appear here.</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CandidateDashboard;
