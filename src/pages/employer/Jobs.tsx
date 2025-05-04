
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';

interface Job {
  id: string;
  title: string;
  applications: number | null;
  views: number | null;
  created_at: string | null;
  status: string;
}

const EmployerJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  useEffect(() => {
    if (!user) return;
    
    const fetchJobs = async () => {
      try {
        const { data, error } = await supabase
          .from('jobs')
          .select('id, title, applications, views, created_at, status')
          .eq('employer_id', user.id)
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
  }, [user, toast]);
  
  const handleJobAction = async (jobId: string, action: string) => {
    try {
      let updateData: { status?: string } = {};
      let successMessage = '';
      
      if (action === 'publish') {
        updateData.status = 'pending';
        successMessage = 'Job sent for approval';
      } else if (action === 'close') {
        updateData.status = 'expired';
        successMessage = 'Job closed successfully';
      } else if (action === 'reactivate') {
        updateData.status = 'pending';
        successMessage = 'Job reactivation request sent';
      } else if (action === 'delete') {
        const { error } = await supabase.from('jobs').delete().eq('id', jobId);
        if (error) throw error;
        
        setJobs(jobs.filter(job => job.id !== jobId));
        toast({
          title: 'Success',
          description: 'Job deleted successfully',
        });
        return;
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
        job.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
  
  const activeJobs = filteredJobs.filter(job => job.status === 'active');
  const draftJobs = filteredJobs.filter(job => job.status === 'draft');
  const pendingJobs = filteredJobs.filter(job => job.status === 'pending');
  const closedJobs = filteredJobs.filter(job => ['expired', 'filled'].includes(job.status));
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };
  
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
          <Button onClick={() => navigate('/employer/post-job')}>
            <Plus className="mr-2 h-4 w-4" /> Post New Job
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Input 
            placeholder="Search jobs..."
            className="max-w-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
                <TabsTrigger value="active">Active ({activeJobs.length})</TabsTrigger>
                <TabsTrigger value="pending">Pending ({pendingJobs.length})</TabsTrigger>
                <TabsTrigger value="draft">Draft ({draftJobs.length})</TabsTrigger>
                <TabsTrigger value="closed">Closed ({closedJobs.length})</TabsTrigger>
              </TabsList>
              
              {/* Active Jobs Tab */}
              <TabsContent value="active" className="space-y-4 pt-4">
                {loading ? (
                  <p>Loading jobs...</p>
                ) : activeJobs.length === 0 ? (
                  <p className="text-center py-4 text-muted-foreground">No active jobs found.</p>
                ) : (
                  activeJobs.map(job => (
                    <div key={job.id} className="flex items-center justify-between border-b pb-4">
                      <div>
                        <p className="font-medium">{job.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {job.applications || 0} applications • {job.views || 0} views • Posted on {formatDate(job.created_at)}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm">View Applicants</Button>
                        <Button variant="outline" size="sm" onClick={() => navigate(`/employer/edit-job/${job.id}`)}>
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleJobAction(job.id, 'close')}
                        >
                          Close
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>
              
              {/* Pending Jobs Tab */}
              <TabsContent value="pending" className="space-y-4 pt-4">
                {loading ? (
                  <p>Loading jobs...</p>
                ) : pendingJobs.length === 0 ? (
                  <p className="text-center py-4 text-muted-foreground">No pending approval jobs found.</p>
                ) : (
                  pendingJobs.map(job => (
                    <div key={job.id} className="flex items-center justify-between border-b pb-4">
                      <div>
                        <p className="font-medium">{job.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Pending approval • Created on {formatDate(job.created_at)}
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
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>
              
              {/* Draft Jobs Tab */}
              <TabsContent value="draft" className="space-y-4 pt-4">
                {loading ? (
                  <p>Loading jobs...</p>
                ) : draftJobs.length === 0 ? (
                  <p className="text-center py-4 text-muted-foreground">No draft jobs found.</p>
                ) : (
                  draftJobs.map(job => (
                    <div key={job.id} className="flex items-center justify-between border-b pb-4">
                      <div>
                        <p className="font-medium">{job.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Draft • Created on {formatDate(job.created_at)}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm"
                          onClick={() => handleJobAction(job.id, 'publish')}
                        >
                          Publish
                        </Button>
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
                          className="text-red-500"
                          onClick={() => handleJobAction(job.id, 'delete')}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>
              
              {/* Closed Jobs Tab */}
              <TabsContent value="closed" className="space-y-4 pt-4">
                {loading ? (
                  <p>Loading jobs...</p>
                ) : closedJobs.length === 0 ? (
                  <p className="text-center py-4 text-muted-foreground">No closed jobs found.</p>
                ) : (
                  closedJobs.map(job => (
                    <div key={job.id} className="flex items-center justify-between border-b pb-4">
                      <div>
                        <p className="font-medium">{job.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {job.status.charAt(0).toUpperCase() + job.status.slice(1)} • 
                          {job.applications || 0} applications • {job.views || 0} views • 
                          Posted on {formatDate(job.created_at)}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                        >
                          View Applicants
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleJobAction(job.id, 'reactivate')}
                        >
                          Reactivate
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default EmployerJobs;
