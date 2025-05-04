
import React from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Search, Briefcase, CheckCircle, XCircle, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const JobsAdmin = () => {
  // Mock data for the jobs page
  const jobs = [
    { 
      id: "1", 
      title: "Senior React Developer", 
      company: "TechCorp Inc.", 
      location: "Nairobi, Kenya", 
      postedDate: "2025-05-01", 
      status: "active",
      applications: 14 
    },
    { 
      id: "2", 
      title: "UI/UX Designer", 
      company: "Design Studio", 
      location: "Remote", 
      postedDate: "2025-04-28", 
      status: "active",
      applications: 8 
    },
    { 
      id: "3", 
      title: "Data Scientist", 
      company: "Analytics Africa", 
      location: "Lagos, Nigeria", 
      postedDate: "2025-04-25", 
      status: "pending",
      applications: 0 
    },
    { 
      id: "4", 
      title: "DevOps Engineer", 
      company: "Cloud Solutions", 
      location: "Cape Town, South Africa", 
      postedDate: "2025-04-22", 
      status: "active",
      applications: 6 
    },
    { 
      id: "5", 
      title: "Marketing Manager", 
      company: "GrowthHub", 
      location: "Accra, Ghana", 
      postedDate: "2025-04-20", 
      status: "expired",
      applications: 11 
    },
  ];

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Job Management</h1>
            <p className="text-muted-foreground">Manage all job listings in the system</p>
          </div>
          <Button className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            <span>Add Job</span>
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search jobs by title, company, or location..." 
              className="pl-8 w-full"
            />
          </div>
          <Button variant="outline">Filters</Button>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>All Jobs</CardTitle>
            <CardDescription>Showing all job listings</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Posted Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applications</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium">{job.title}</TableCell>
                    <TableCell>{job.company}</TableCell>
                    <TableCell>{job.location}</TableCell>
                    <TableCell>{new Date(job.postedDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        job.status === 'active' 
                          ? 'bg-green-100 text-green-800'
                          : job.status === 'pending' 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-gray-100 text-gray-800'
                      }`}>
                        {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell>{job.applications}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {job.status === 'pending' ? (
                        <>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600">
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <Button variant="ghost" size="sm">Edit</Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default JobsAdmin;
