
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { approveJob, rejectJob } from '@/utils/api/adminApi';

interface JobApprovalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  job: {
    id: string;
    title: string;
    company: string;
    status: string;
  } | null;
  action: 'approve' | 'reject' | null;
  onSuccess: () => void;
}

export const JobApprovalDialog = ({ 
  isOpen, 
  onClose, 
  job, 
  action, 
  onSuccess 
}: JobApprovalDialogProps) => {
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!job || !action) return;

    if (action === 'reject' && !reason.trim()) {
      toast({
        title: 'Rejection reason required',
        description: 'Please provide a reason for rejecting this job.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (action === 'approve') {
        await approveJob(job.id, reason.trim() || undefined, notes.trim() || undefined);
        toast({
          title: 'Job approved',
          description: `"${job.title}" has been approved and is now active.`,
        });
      } else {
        await rejectJob(job.id, reason.trim(), notes.trim() || undefined);
        toast({
          title: 'Job rejected',
          description: `"${job.title}" has been rejected and moved to draft.`,
        });
      }

      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error(`Error ${action}ing job:`, error);
      toast({
        title: 'Error',
        description: error.message || `Failed to ${action} job`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setReason('');
    setNotes('');
    setIsSubmitting(false);
    onClose();
  };

  if (!job || !action) return null;

  const isApproval = action === 'approve';

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isApproval ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
            {isApproval ? 'Approve Job' : 'Reject Job'}
          </DialogTitle>
          <DialogDescription>
            You are about to {action} the job "{job.title}" from {job.company}.
            {!isApproval && ' Please provide a reason for rejection.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">
              {isApproval ? 'Approval Reason (Optional)' : 'Rejection Reason (Required)'}
            </Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={
                isApproval 
                  ? 'Enter reason for approval (optional)...'
                  : 'Enter reason for rejection (required)...'
              }
              rows={3}
              className={!isApproval && !reason.trim() ? 'border-red-300' : ''}
            />
            {!isApproval && !reason.trim() && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Rejection reason is required
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Review Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes for your review..."
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant={isApproval ? 'default' : 'destructive'}
            onClick={handleSubmit}
            disabled={isSubmitting || (!isApproval && !reason.trim())}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {isApproval ? 'Approving...' : 'Rejecting...'}
              </>
            ) : (
              <>
                {isApproval ? 'Approve Job' : 'Reject Job'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
