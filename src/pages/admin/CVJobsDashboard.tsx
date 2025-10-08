import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Download, RefreshCw, Trash2, Eye, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { formatDistanceToNow } from 'date-fns';

interface CVJob {
  id: string;
  job_id: string;
  file_name: string;
  user_email: string | null;
  status: string;
  progress: number;
  error_message: string | null;
  created_at: string;
  processing_started_at: string | null;
  processing_completed_at: string | null;
  download_url: string | null;
  tailored_content: string | null;
  job_title: string | null;
  company_name: string | null;
}

interface JobStats {
  total_jobs: number;
  queued_jobs: number;
  processing_jobs: number;
  completed_jobs: number;
  failed_jobs: number;
  avg_processing_time: string | null;
}

export default function CVJobsDashboard() {
  const [jobs, setJobs] = useState<CVJob[]>([]);
  const [stats, setStats] = useState<JobStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedJob, setSelectedJob] = useState<CVJob | null>(null);
  const [deleteJobId, setDeleteJobId] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const loadJobs = async () => {
    try {
      let query = supabase
        .from('cv_jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setJobs(data || []);
    } catch (error: any) {
      console.error('Error loading jobs:', error);
      toast.error('Failed to load jobs');
    }
  };

  const loadStats = async () => {
    try {
      const { data, error } = await supabase.rpc('get_cv_job_stats');
      if (error) throw error;
      if (data && data.length > 0) {
        const statsData = data[0] as any;
        setStats({
          ...statsData,
          avg_processing_time: statsData.avg_processing_time as string | null
        });
      }
    } catch (error: any) {
      console.error('Error loading stats:', error);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([loadJobs(), loadStats()]);
      setLoading(false);
    };
    init();
  }, [statusFilter]);

  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      loadJobs();
      loadStats();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, statusFilter]);

  const handleRetry = async (jobId: string) => {
    try {
      const { error } = await supabase.rpc('admin_retry_cv_job', { p_job_id: jobId });
      if (error) throw error;
      toast.success('Job queued for retry');
      loadJobs();
      loadStats();
    } catch (error: any) {
      console.error('Error retrying job:', error);
      toast.error('Failed to retry job');
    }
  };

  const handleDelete = async () => {
    if (!deleteJobId) return;
    
    try {
      const { error } = await supabase.rpc('admin_delete_cv_job', { p_job_id: deleteJobId });
      if (error) throw error;
      toast.success('Job deleted');
      setDeleteJobId(null);
      loadJobs();
      loadStats();
    } catch (error: any) {
      console.error('Error deleting job:', error);
      toast.error('Failed to delete job');
    }
  };

  const handleDownload = (content: string, fileName: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tailored_${fileName}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", icon: any }> = {
      completed: { variant: "default", icon: CheckCircle2 },
      processing: { variant: "secondary", icon: Loader2 },
      queued: { variant: "outline", icon: Clock },
      failed: { variant: "destructive", icon: XCircle },
    };

    const config = variants[status] || { variant: "outline", icon: AlertCircle };
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="capitalize">
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const getProcessingTime = (job: CVJob): string => {
    if (!job.processing_started_at) return 'N/A';
    
    const endTime = job.processing_completed_at 
      ? new Date(job.processing_completed_at)
      : new Date();
    const startTime = new Date(job.processing_started_at);
    const seconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${seconds % 60}s`;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">CV Processing Dashboard</h1>
            <p className="text-muted-foreground">Monitor and manage background CV tailoring jobs</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => { loadJobs(); loadStats(); }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button
              variant={autoRefresh ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              <Clock className="h-4 w-4 mr-2" />
              Auto: {autoRefresh ? 'ON' : 'OFF'}
            </Button>
          </div>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid gap-4 md:grid-cols-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_jobs}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Queued</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.queued_jobs}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Processing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.processing_jobs}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.completed_jobs}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Failed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.failed_jobs}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.avg_processing_time ? `${Math.round(parseFloat(stats.avg_processing_time) / 60)}m` : 'N/A'}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter by Status</CardTitle>
            <CardDescription>View jobs by their processing status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {['all', 'queued', 'processing', 'completed', 'failed'].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                  className="capitalize"
                >
                  {status}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Jobs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Processing Jobs</CardTitle>
            <CardDescription>All CV tailoring jobs and their statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job ID</TableHead>
                  <TableHead>File Name</TableHead>
                  <TableHead>User Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Upload Time</TableHead>
                  <TableHead>Processing Time</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      No jobs found
                    </TableCell>
                  </TableRow>
                ) : (
                  jobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell className="font-mono text-xs">{job.job_id.slice(0, 8)}...</TableCell>
                      <TableCell>{job.file_name}</TableCell>
                      <TableCell>{job.user_email || 'N/A'}</TableCell>
                      <TableCell>{getStatusBadge(job.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-secondary h-2 rounded-full overflow-hidden">
                            <div 
                              className="bg-primary h-full transition-all"
                              style={{ width: `${job.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">{job.progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">
                        {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                      </TableCell>
                      <TableCell className="text-xs">{getProcessingTime(job)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedJob(job)}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {job.status === 'failed' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRetry(job.id)}
                              title="Retry Job"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          )}
                          {job.tailored_content && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDownload(job.tailored_content!, job.file_name)}
                              title="Download Result"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteJobId(job.id)}
                            title="Delete Job"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Job Details Dialog */}
        <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Job Details</DialogTitle>
              <DialogDescription>Complete information about this processing job</DialogDescription>
            </DialogHeader>
            {selectedJob && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Job ID</p>
                    <p className="text-sm text-muted-foreground font-mono">{selectedJob.job_id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <div className="mt-1">{getStatusBadge(selectedJob.status)}</div>
                  </div>
                  <div>
                    <p className="text-sm font-medium">File Name</p>
                    <p className="text-sm text-muted-foreground">{selectedJob.file_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">User Email</p>
                    <p className="text-sm text-muted-foreground">{selectedJob.user_email || 'Not provided'}</p>
                  </div>
                  {selectedJob.job_title && (
                    <div>
                      <p className="text-sm font-medium">Job Title</p>
                      <p className="text-sm text-muted-foreground">{selectedJob.job_title}</p>
                    </div>
                  )}
                  {selectedJob.company_name && (
                    <div>
                      <p className="text-sm font-medium">Company</p>
                      <p className="text-sm text-muted-foreground">{selectedJob.company_name}</p>
                    </div>
                  )}
                </div>
                {selectedJob.error_message && (
                  <div>
                    <p className="text-sm font-medium text-destructive">Error Message</p>
                    <p className="text-sm text-muted-foreground bg-destructive/10 p-2 rounded mt-1">
                      {selectedJob.error_message}
                    </p>
                  </div>
                )}
                {selectedJob.tailored_content && (
                  <div>
                    <p className="text-sm font-medium mb-2">Tailored Content Preview</p>
                    <div className="bg-secondary p-4 rounded max-h-60 overflow-y-auto">
                      <pre className="text-xs whitespace-pre-wrap">{selectedJob.tailored_content.slice(0, 500)}...</pre>
                    </div>
                    <Button 
                      onClick={() => handleDownload(selectedJob.tailored_content!, selectedJob.file_name)}
                      className="mt-2"
                      size="sm"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Full Content
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteJobId} onOpenChange={() => setDeleteJobId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Job</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this job? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}
