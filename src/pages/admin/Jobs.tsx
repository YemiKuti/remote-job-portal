
import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Search, Briefcase, CheckCircle, XCircle, Eye, Plus, Filter, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import { Job } from "@/types/api";

// Define a simplified job type for the admin page
interface AdminJob {
  id: string;
  title: string;
  company: string;
  location: string;
  created_at: string;
  status: string;
  applications: number;
}

const JobsAdmin = () => {
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('jobs')
          .select('id, title, company, location, created_at, status, applications')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        setJobs(data || []);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        toast({
          title: 'Error',
          description: 'Failed to load jobs. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobs();
  }, [toast]);

  const handleJobAction = async (jobId: string, action: string) => {
    try {
      let updateData: { status?: string } = {};
      let successMessage = '';
      
      if (action === 'approve') {
        updateData.status = 'active';
        successMessage = 'Job approved and published';
      } else if (action === 'reject') {
        updateData.status = 'draft';
        successMessage = 'Job rejected and moved to draft';
      }
      
      if (Object.keys(updateData).length > 0) {
        const { error } = await supabase
          .from('jobs')
          .update(updateData)
          .eq('id', jobId);
        
        if (error) throw error;
        
        // Update local state
        setJobs(jobs.map(job => 
          job.id === jobId 
            ? { ...job, ...updateData } 
            : job
        ));
        
        toast({
          title: 'Success',
          description: successMessage,
        });
      }
    } catch (error) {
      console.error(`Error performing action ${action}:`, error);
      toast({
        title: 'Error',
        description: `Failed to ${action} job. Please try again.`,
        variant: 'destructive',
      });
    }
  };

  const filteredJobs = searchTerm.trim() === '' 
    ? jobs 
    : jobs.filter(job => 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase())
      );

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Job Management</h1>
            <p className="text-muted-foreground">Manage all job listings in the system</p>
          </div>
          <Button className="flex items-center gap-2" onClick={() => navigate('/admin/create-job')}>
            <Plus className="h-4 w-4" />
            <span>Create Job</span>
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search jobs by title, company, or location..." 
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" /> Filters
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>All Jobs</CardTitle>
            <CardDescription>Showing all job listings</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No jobs found. Try a different search term.</p>
              </div>
            ) : (
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
                  {filteredJobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell className="font-medium">{job.title}</TableCell>
                      <TableCell>{job.company}</TableCell>
                      <TableCell>{job.location}</TableCell>
                      <TableCell>{job.created_at ? new Date(job.created_at).toLocaleDateString() : 'N/A'}</TableCell>
                      <TableCell>
                        <Badge className={`px-2 py-1 rounded-full text-xs ${
                          job.status === 'active' 
                            ? 'bg-green-100 text-green-800'
                            : job.status === 'pending' 
                              ? 'bg-amber-100 text-amber-800' 
                              : 'bg-gray-100 text-gray-800'
                        }`}>
                          {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>{job.applications || 0}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => navigate(`/admin/edit-job/${job.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {job.status === 'pending' && (
                          <>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-green-600"
                              onClick={() => handleJobAction(job.id, 'approve')}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-red-600"
                              onClick={() => handleJobAction(job.id, 'reject')}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {job.status !== 'pending' && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => navigate(`/admin/edit-job/${job.id}`)}
                          >
                            Edit
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default JobsAdmin;
