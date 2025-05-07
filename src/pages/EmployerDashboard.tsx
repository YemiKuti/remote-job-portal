
import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Eye, Briefcase, BarChart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EmployerDashboard = () => {
  const navigate = useNavigate();
  
  // Mock data
  const recentApplications = [
    { id: '1', candidate: 'John Smith', position: 'Frontend Developer', date: '2025-05-01', status: 'pending' },
    { id: '2', candidate: 'Sarah Jones', position: 'UX Designer', date: '2025-04-28', status: 'reviewed' },
    { id: '3', candidate: 'Michael Brown', position: 'Product Manager', date: '2025-04-26', status: 'shortlisted' },
  ];
  
  const postedJobs = [
    { id: '1', title: 'Senior Frontend Developer', applications: 12, views: 245, postedDate: '2025-04-25', status: 'active' },
    { id: '2', title: 'UX/UI Designer', applications: 8, views: 180, postedDate: '2025-04-20', status: 'active' },
  ];
  
  const stats = {
    totalViews: 620,
    totalApplications: 35,
    activeJobs: 4,
    candidatesShortlisted: 7
  };
  
  return (
    <DashboardLayout userType="employer">
      <div className="grid grid-cols-1 gap-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalViews}</div>
              <p className="text-xs text-muted-foreground">+15% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Applications</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalApplications}</div>
              <p className="text-xs text-muted-foreground">+8 this week</p>
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
              {recentApplications.map(app => (
                <div key={app.id} className="flex items-center justify-between border-b pb-2 last:border-b-0">
                  <div>
                    <p className="font-medium">{app.candidate}</p>
                    <p className="text-sm text-muted-foreground">{app.position} • Applied on {new Date(app.date).toLocaleDateString()}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm">Review</Button>
                    <Button variant="outline" size="sm">Profile</Button>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full">View All Applications</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Posted Jobs</CardTitle>
              <CardDescription>Your active job listings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {postedJobs.map(job => (
                <div key={job.id} className="flex items-center justify-between border-b pb-2 last:border-b-0">
                  <div>
                    <p className="font-medium">{job.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {job.applications} applications • {job.views} views • Posted on {new Date(job.postedDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">Edit</Button>
                    <Button variant="outline" size="sm">View</Button>
                  </div>
                </div>
              ))}
              <Button className="w-full" onClick={() => navigate('/employer/post-job')}>Post New Job</Button>
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
                      {[1, 2, 3, 4].map(i => (
                        <tr key={i} className="bg-white border-b">
                          <td className="px-6 py-4 font-medium">Candidate {i}</td>
                          <td className="px-6 py-4">Software Engineer</td>
                          <td className="px-6 py-4">May 1, 2025</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                              Pending
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
