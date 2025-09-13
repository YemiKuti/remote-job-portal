import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, AlertCircle, Mail, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface JobApprovalPanelProps {
  onJobsUpdated: () => void;
}

interface PendingJob {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  apply_email?: string;
  application_value?: string;
  application_type: string;
  status: string;
  created_at: string;
  employment_type?: string;
  experience_level?: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
}

export const JobApprovalPanel: React.FC<JobApprovalPanelProps> = ({ onJobsUpdated }) => {
  const [pendingJobs, setPendingJobs] = useState<PendingJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const { toast } = useToast();

  const fetchPendingJobs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPendingJobs(data || []);
    } catch (error: any) {
      console.error('Error fetching pending jobs:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch pending jobs',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchPendingJobs();
  }, []);

  const handleApprove = async (jobId: string) => {
    setApproving(jobId);
    try {
      const { error } = await supabase.rpc('admin_approve_job', {
        job_id: jobId,
        approval_reason: 'Job approved for publication'
      });

      if (error) throw error;

      toast({
        title: 'Job Approved',
        description: 'Job has been approved and is now live'
      });

      await fetchPendingJobs();
      onJobsUpdated();
    } catch (error: any) {
      console.error('Error approving job:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve job',
        variant: 'destructive'
      });
    } finally {
      setApproving(null);
    }
  };

  const handleReject = async (jobId: string) => {
    if (!rejectionReason.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a rejection reason',
        variant: 'destructive'
      });
      return;
    }

    setRejecting(jobId);
    try {
      const { error } = await supabase.rpc('admin_reject_job', {
        job_id: jobId,
        rejection_reason: rejectionReason
      });

      if (error) throw error;

      toast({
        title: 'Job Rejected',
        description: 'Job has been rejected and moved to draft status'
      });

      await fetchPendingJobs();
      onJobsUpdated();
      setRejectionReason('');
    } catch (error: any) {
      console.error('Error rejecting job:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject job',
        variant: 'destructive'
      });
    } finally {
      setRejecting(null);
    }
  };

  const formatSalary = (job: PendingJob): string => {
    if (!job.salary_min && !job.salary_max) return 'Not specified';
    
    const currency = job.salary_currency || 'USD';
    const formatAmount = (amount: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    };

    if (job.salary_min && job.salary_max) {
      return `${formatAmount(job.salary_min)} - ${formatAmount(job.salary_max)}`;
    } else if (job.salary_min) {
      return `From ${formatAmount(job.salary_min)}`;
    } else if (job.salary_max) {
      return `Up to ${formatAmount(job.salary_max)}`;
    }
    
    return 'Not specified';
  };

  const formatDescription = (description: string): JSX.Element => {
    const paragraphs = description.split('\n').filter(p => p.trim());
    
    return (
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {paragraphs.slice(0, 5).map((paragraph, index) => {
          const trimmed = paragraph.trim();
          if (!trimmed) return null;
          
          if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
            return (
              <div key={index} className="flex items-start gap-2">
                <span className="text-primary mt-1 text-xs">•</span>
                <span className="text-sm text-muted-foreground">{trimmed.replace(/^[•\-*]\s*/, '')}</span>
              </div>
            );
          }
          
          return (
            <p key={index} className="text-sm text-muted-foreground leading-relaxed">
              {trimmed}
            </p>
          );
        })}
        {paragraphs.length > 5 && (
          <p className="text-xs text-muted-foreground italic">... and {paragraphs.length - 5} more paragraphs</p>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pending Job Approvals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-2">Loading pending jobs...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (pendingJobs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pending Job Approvals</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              All jobs have been reviewed. No pending approvals at this time.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-orange-500" />
          Pending Job Approvals ({pendingJobs.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {pendingJobs.map((job) => (
            <div key={job.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{job.title}</h3>
                  <p className="text-muted-foreground">{job.company} • {job.location}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline">{job.employment_type}</Badge>
                    <Badge variant="outline">{job.experience_level}</Badge>
                    <Badge variant="secondary">{formatSalary(job)}</Badge>
                  </div>
                </div>
                <Badge variant="secondary">
                  Submitted {new Date(job.created_at).toLocaleDateString()}
                </Badge>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium mb-2">Job Description</h4>
                  {formatDescription(job.description)}
                </div>

                {job.apply_email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Contact Email:</span>
                    <span className="text-primary">{job.apply_email}</span>
                  </div>
                )}

                {job.application_value && job.application_value !== job.apply_email && (
                  <div className="flex items-center gap-2 text-sm">
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Application URL:</span>
                    <a 
                      href={job.application_value} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {job.application_value}
                    </a>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={() => handleApprove(job.id)}
                  disabled={approving === job.id}
                  className="flex items-center gap-2"
                >
                  {approving === job.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                  Approve & Publish
                </Button>

                <div className="flex gap-2 flex-1">
                  <Textarea
                    placeholder="Rejection reason (required)"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="flex-1 h-10"
                  />
                  <Button
                    variant="destructive"
                    onClick={() => handleReject(job.id)}
                    disabled={rejecting === job.id || !rejectionReason.trim()}
                    className="flex items-center gap-2"
                  >
                    {rejecting === job.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                    Reject
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};