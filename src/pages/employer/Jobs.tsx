
import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search, Plus } from 'lucide-react';

const EmployerJobs = () => {
  // Mock data
  const activeJobs = [
    { id: '1', title: 'Senior Frontend Developer', applications: 12, views: 245, postedDate: '2025-04-25', status: 'active' },
    { id: '2', title: 'UX/UI Designer', applications: 8, views: 180, postedDate: '2025-04-20', status: 'active' },
  ];
  
  const closedJobs = [
    { id: '3', title: 'Backend Developer', applications: 15, views: 320, postedDate: '2025-03-25', status: 'closed' },
  ];
  
  const draftJobs = [
    { id: '4', title: 'Product Manager', applications: 0, views: 0, postedDate: '2025-04-28', status: 'draft' },
  ];
  
  return (
    <DashboardLayout userType="employer">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Job Listings</h2>
            <p className="text-muted-foreground">
              Manage your job postings and applications
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Post New Job
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Input 
            placeholder="Search jobs..."
            className="max-w-sm"
          />
          <Button variant="outline" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>All Job Postings</CardTitle>
            <CardDescription>View and manage all your job listings</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="active">
              <TabsList>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="draft">Draft</TabsTrigger>
                <TabsTrigger value="closed">Closed</TabsTrigger>
              </TabsList>
              <TabsContent value="active" className="space-y-4 pt-4">
                {activeJobs.map(job => (
                  <div key={job.id} className="flex items-center justify-between border-b pb-4">
                    <div>
                      <p className="font-medium">{job.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {job.applications} applications • {job.views} views • Posted on {new Date(job.postedDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm">View Applicants</Button>
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button variant="outline" size="sm">Close</Button>
                    </div>
                  </div>
                ))}
              </TabsContent>
              <TabsContent value="draft" className="space-y-4 pt-4">
                {draftJobs.map(job => (
                  <div key={job.id} className="flex items-center justify-between border-b pb-4">
                    <div>
                      <p className="font-medium">{job.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Draft • Created on {new Date(job.postedDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm">Publish</Button>
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button variant="outline" size="sm" className="text-red-500">Delete</Button>
                    </div>
                  </div>
                ))}
              </TabsContent>
              <TabsContent value="closed" className="space-y-4 pt-4">
                {closedJobs.map(job => (
                  <div key={job.id} className="flex items-center justify-between border-b pb-4">
                    <div>
                      <p className="font-medium">{job.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {job.applications} applications • {job.views} views • Posted on {new Date(job.postedDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">View Applicants</Button>
                      <Button variant="outline" size="sm">Reactivate</Button>
                    </div>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default EmployerJobs;
