import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Loader2, FileText, User, Mail, Phone } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { applyToJob } from '@/utils/api/candidateApi';
import { Job } from '@/types';

interface ApplyJobDialogProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job;
  onApplicationSuccess?: () => void;
}

const ApplyJobDialog = ({ isOpen, onClose, job, onApplicationSuccess }: ApplyJobDialogProps) => {
  const { user } = useAuth();
  const [coverLetter, setCoverLetter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setErrorMessage('You must be logged in to apply for jobs');
      setApplicationStatus('error');
      return;
    }

    // Validate that job has an employer
    if (!job.employerId) {
      setErrorMessage('This job posting is missing employer information. Please contact support.');
      setApplicationStatus('error');
      return;
    }

    setIsSubmitting(true);
    setApplicationStatus('idle');
    setErrorMessage('');

    try {
      const data = await applyToJob({
        jobId: job.id,
        employerId: job.employerId,
        coverLetter: coverLetter
      });
      
      if (data) {
        setApplicationStatus('success');
        onApplicationSuccess?.();
        
        // Close dialog after 2 seconds
        setTimeout(() => {
          onClose();
          setApplicationStatus('idle');
          setCoverLetter('');
        }, 2000);
      } else {
        setApplicationStatus('error');
        setErrorMessage('Failed to submit application. Please try again.');
      }
    } catch (error: any) {
      console.error('Error applying to job:', error);
      setApplicationStatus('error');
      setErrorMessage(error.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      setApplicationStatus('idle');
      setCoverLetter('');
      setErrorMessage('');
    }
  };

  if (!user) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sign In Required</DialogTitle>
            <DialogDescription>
              You need to sign in to apply for jobs
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Alert>
              <User className="h-4 w-4" />
              <AlertDescription>
                Please sign in to your account to continue with your job application.
              </AlertDescription>
            </Alert>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleClose}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Apply for {job.title}</DialogTitle>
          <DialogDescription>
            {job.company} • {job.location}
          </DialogDescription>
        </DialogHeader>

        {applicationStatus === 'success' ? (
          <div className="py-8 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Application Submitted!</h3>
            <p className="text-muted-foreground mb-4">
              Your application has been successfully submitted. The employer will review it and get back to you.
            </p>
            <p className="text-sm text-muted-foreground">
              You can track your application status in your candidate dashboard.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Applicant Info */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Your Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <Label className="text-sm text-muted-foreground">Full Name</Label>
                  <p className="font-medium">{user.user_metadata?.full_name || 'Not provided'}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Email</Label>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Cover Letter */}
            <div className="space-y-2">
              <Label htmlFor="coverLetter" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Cover Letter (Optional)
              </Label>
              <Textarea
                id="coverLetter"
                placeholder="Tell the employer why you're interested in this position and how your skills match their requirements..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={6}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                A well-written cover letter can help your application stand out.
              </p>
            </div>

            {/* Error Message */}
            {applicationStatus === 'error' && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            {/* Job Summary */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Job Summary</h4>
              <div className="text-sm space-y-1">
                <p><strong>Position:</strong> {job.title}</p>
                <p><strong>Company:</strong> {job.company}</p>
                <p><strong>Location:</strong> {job.location}</p>
                <p><strong>Employment Type:</strong> {job.employmentType}</p>
                {job.salary && (
                  <p><strong>Salary:</strong> {job.salary.currency} {job.salary.min?.toLocaleString()} - {job.salary.max?.toLocaleString()}</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !job.employerId}
                className="bg-job-green hover:bg-job-darkGreen"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Application'
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ApplyJobDialog;
