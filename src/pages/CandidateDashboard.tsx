
import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Briefcase, Building, Star } from 'lucide-react';

const CandidateDashboard = () => {
  // Mock data
  const recentApplications = [
    { id: '1', position: 'Frontend Developer', company: 'Acme Inc', date: '2025-04-28', status: 'pending' },
    { id: '2', position: 'UX Designer', company: 'Widget Co', date: '2025-04-25', status: 'reviewed' },
    { id: '3', position: 'Product Manager', company: 'Tech Solutions', date: '2025-04-20', status: 'rejected' },
  ];
  
  const savedJobs = [
    { id: '1', position: 'Backend Engineer', company: 'Cloud Services', location: 'Remote', savedDate: '2025-05-01' },
    { id: '2', position: 'DevOps Specialist', company: 'Infrastructure Inc', location: 'New York', savedDate: '2025-04-29' },
  ];
  
  const stats = {
    profileViews: 45,
    totalApplications: 12,
    savedJobs: 8,
    followedCompanies: 5
  };
  
  return (
    <DashboardLayout userType="candidate">
      <div className="grid grid-cols-1 gap-6">
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
              <CardTitle>Recent Applications</CardTitle>
              <CardDescription>Your recent job applications and their status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentApplications.map(app => (
                <div key={app.id} className="flex items-center justify-between border-b pb-2 last:border-b-0">
                  <div>
                    <p className="font-medium">{app.position}</p>
                    <p className="text-sm text-muted-foreground">{app.company} • Applied on {new Date(app.date).toLocaleDateString()}</p>
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
              ))}
              <Button variant="outline" className="w-full">View All Applications</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Saved Jobs</CardTitle>
              <CardDescription>Jobs you saved for later</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {savedJobs.map(job => (
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
              ))}
              <Button variant="outline" className="w-full">View All Saved Jobs</Button>
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
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center justify-between border-b pb-4 last:border-b-0">
                    <div>
                      <p className="font-medium">Senior Software Engineer</p>
                      <p className="text-sm text-muted-foreground">TechCorp • San Francisco, CA</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                          React
                        </span>
                        <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                          TypeScript
                        </span>
                        <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                          Node.js
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button>Apply Now</Button>
                      <Button variant="outline">Save</Button>
                    </div>
                  </div>
                ))}
              </TabsContent>
              <TabsContent value="new">
                <div className="text-center py-6">
                  <p className="text-muted-foreground">New jobs will appear here.</p>
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
