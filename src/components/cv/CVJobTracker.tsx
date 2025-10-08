import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useCVJobTracking } from '@/hooks/useCVJobTracking';
import { CheckCircle2, XCircle, Loader2, Download, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface CVJobTrackerProps {
  jobId: string;
  onComplete?: (tailoredContent: string) => void;
  onError?: (error: string) => void;
}

export const CVJobTracker: React.FC<CVJobTrackerProps> = ({ 
  jobId, 
  onComplete, 
  onError 
}) => {
  const { job, loading, error } = useCVJobTracking(jobId);

  React.useEffect(() => {
    if (job?.status === 'completed' && job.tailored_content && onComplete) {
      onComplete(job.tailored_content);
    }
    if (job?.status === 'failed' && job.error_message && onError) {
      onError(job.error_message);
    }
  }, [job?.status]);

  const handleDownload = () => {
    if (!job?.tailored_content) return;

    const blob = new Blob([job.tailored_content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tailored_${job.file_name}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Resume downloaded successfully');
  };

  if (loading && !job) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading job status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !job) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center text-destructive">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>Failed to load job status</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusDisplay = () => {
    switch (job.status) {
      case 'queued':
        return {
          icon: <Loader2 className="h-5 w-5 animate-spin text-blue-600" />,
          title: 'Queued',
          description: 'Your CV is waiting to be processed...'
        };
      case 'processing':
        return {
          icon: <Loader2 className="h-5 w-5 animate-spin text-yellow-600" />,
          title: 'Processing',
          description: 'Tailoring your CV...'
        };
      case 'completed':
        return {
          icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
          title: 'Completed',
          description: 'Your tailored CV is ready!'
        };
      case 'failed':
        return {
          icon: <XCircle className="h-5 w-5 text-red-600" />,
          title: 'Failed',
          description: job.error_message || 'Processing failed'
        };
      default:
        return {
          icon: <AlertCircle className="h-5 w-5" />,
          title: 'Unknown',
          description: 'Status unknown'
        };
    }
  };

  const status = getStatusDisplay();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          {status.icon}
          <div>
            <CardTitle>{status.title}</CardTitle>
            <CardDescription>{status.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {(job.status === 'queued' || job.status === 'processing') && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{job.progress}%</span>
            </div>
            <Progress value={job.progress} />
          </div>
        )}

        {job.status === 'completed' && job.tailored_content && (
          <div className="space-y-4">
            <div className="bg-secondary p-4 rounded max-h-60 overflow-y-auto">
              <pre className="text-xs whitespace-pre-wrap">
                {job.tailored_content.slice(0, 500)}...
              </pre>
            </div>
            <Button onClick={handleDownload} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Download Tailored CV
            </Button>
          </div>
        )}

        {job.status === 'failed' && (
          <div className="bg-destructive/10 p-4 rounded">
            <p className="text-sm text-destructive">
              {job.error_message || 'An error occurred during processing'}
            </p>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <p>File: {job.file_name}</p>
          <p>Job ID: {job.job_id}</p>
        </div>
      </CardContent>
    </Card>
  );
};
