
import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Building, Briefcase, DollarSign, Settings, Database, Server } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  // Mock data for admin dashboard
  const stats = {
    totalUsers: 1254,
    totalCompanies: 87,
    totalJobs: 342,
    totalRevenue: 24680
  };
  
  const recentUsers = [
    { id: '1', name: 'John Smith', email: 'john@example.com', role: 'candidate', joinDate: '2025-05-01' },
    { id: '2', name: 'Acme Inc', email: 'hr@acme.com', role: 'employer', joinDate: '2025-04-29' },
    { id: '3', name: 'Sarah Thompson', email: 'sarah@example.com', role: 'candidate', joinDate: '2025-04-28' },
  ];
  
  const recentJobs = [
    { id: '1', title: 'Senior Developer', company: 'Tech Corp', postedDate: '2025-05-01', status: 'active' },
    { id: '2', title: 'Marketing Manager', company: 'Brand Solutions', postedDate: '2025-04-30', status: 'pending' },
    { id: '3', title: 'UX Designer', company: 'Design Studio', postedDate: '2025-04-28', status: 'active' },
  ];
  
  return (
    <DashboardLayout userType="admin">
      <div className="grid grid-cols-1 gap-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">+24 this week</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Companies</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCompanies}</div>
              <p className="text-xs text-muted-foreground">+5 this week</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Job Listings</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalJobs}</div>
              <p className="text-xs text-muted-foreground">+18 this week</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalRevenue}</div>
              <p className="text-xs text-muted-foreground">+$1,240 this month</p>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Users</CardTitle>
              <CardDescription>New user registrations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentUsers.map(user => (
                <div key={user.id} className="flex items-center justify-between border-b pb-2 last:border-b-0">
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {user.email} • {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">View</Button>
                    <Button size="sm" variant="outline">Edit</Button>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full">View All Users</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Job Postings</CardTitle>
              <CardDescription>Latest job listings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentJobs.map(job => (
                <div key={job.id} className="flex items-center justify-between border-b pb-2 last:border-b-0">
                  <div>
                    <p className="font-medium">{job.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {job.company} • Posted on {new Date(job.postedDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      job.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </span>
                    <Button size="sm" variant="outline">Review</Button>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full">View All Jobs</Button>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>System Management</CardTitle>
            <CardDescription>Manage all aspects of the job portal</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="users">
              <TabsList className="mb-4">
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="jobs">Jobs</TabsTrigger>
                <TabsTrigger value="companies">Companies</TabsTrigger>
                <TabsTrigger value="payments">Payments</TabsTrigger>
                <TabsTrigger value="tools">Tools</TabsTrigger>
              </TabsList>
              <TabsContent value="users" className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                  <Button className="flex h-24 flex-col items-center justify-center gap-1">
                    <Users className="h-8 w-8" />
                    <span>Manage Users</span>
                  </Button>
                  <Button variant="outline" className="flex h-24 flex-col items-center justify-center gap-1">
                    <Users className="h-8 w-8" />
                    <span>Add User</span>
                  </Button>
                  <Button variant="outline" className="flex h-24 flex-col items-center justify-center gap-1">
                    <Users className="h-8 w-8" />
                    <span>User Roles</span>
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="jobs">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                  <Button className="flex h-24 flex-col items-center justify-center gap-1">
                    <Briefcase className="h-8 w-8" />
                    <span>Manage Jobs</span>
                  </Button>
                  <Button variant="outline" className="flex h-24 flex-col items-center justify-center gap-1">
                    <Briefcase className="h-8 w-8" />
                    <span>Job Categories</span>
                  </Button>
                  <Button variant="outline" className="flex h-24 flex-col items-center justify-center gap-1">
                    <Briefcase className="h-8 w-8" />
                    <span>Job Approval</span>
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="companies">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                  <Button className="flex h-24 flex-col items-center justify-center gap-1">
                    <Building className="h-8 w-8" />
                    <span>Manage Companies</span>
                  </Button>
                  <Button variant="outline" className="flex h-24 flex-col items-center justify-center gap-1">
                    <Building className="h-8 w-8" />
                    <span>Company Categories</span>
                  </Button>
                  <Button variant="outline" className="flex h-24 flex-col items-center justify-center gap-1">
                    <Building className="h-8 w-8" />
                    <span>Verify Companies</span>
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="payments">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                  <Button className="flex h-24 flex-col items-center justify-center gap-1">
                    <DollarSign className="h-8 w-8" />
                    <span>Transaction History</span>
                  </Button>
                  <Button variant="outline" className="flex h-24 flex-col items-center justify-center gap-1">
                    <DollarSign className="h-8 w-8" />
                    <span>Manage Plans</span>
                  </Button>
                  <Button variant="outline" className="flex h-24 flex-col items-center justify-center gap-1">
                    <DollarSign className="h-8 w-8" />
                    <span>Payment Settings</span>
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="tools">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                  <Button className="flex h-24 flex-col items-center justify-center gap-1" asChild>
                    <Link to="/job-scraper">
                      <Server className="h-8 w-8" />
                      <span>Job Scraper Tool</span>
                    </Link>
                  </Button>
                  <Button variant="outline" className="flex h-24 flex-col items-center justify-center gap-1">
                    <Database className="h-8 w-8" />
                    <span>Data Import/Export</span>
                  </Button>
                  <Button variant="outline" className="flex h-24 flex-col items-center justify-center gap-1">
                    <Settings className="h-8 w-8" />
                    <span>System Settings</span>
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
