
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Star, User, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface StatusUpdateButtonProps {
  currentStatus: string;
  targetStatus: 'shortlisted' | 'interviewed' | 'hired' | 'rejected';
  applicationId: string;
  onUpdateStatus: (applicationId: string, newStatus: string, notes?: string) => void;
  candidateName: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'destructive' | 'secondary';
  className?: string;
}

const statusConfig = {
  shortlisted: {
    icon: Star,
    label: 'Shortlist',
    description: 'Move this candidate to your shortlist for further consideration.',
    confirmText: 'Yes, shortlist candidate'
  },
  interviewed: {
    icon: User,
    label: 'Schedule Interview',
    description: 'Mark this candidate as interviewed or ready for interview.',
    confirmText: 'Yes, mark as interviewed'
  },
  hired: {
    icon: CheckCircle,
    label: 'Hire',
    description: 'Mark this candidate as hired for the position.',
    confirmText: 'Yes, mark as hired'
  },
  rejected: {
    icon: User,
    label: 'Reject',
    description: 'Reject this candidate\'s application.',
    confirmText: 'Yes, reject candidate'
  }
};

export const StatusUpdateButton: React.FC<StatusUpdateButtonProps> = ({
  currentStatus,
  targetStatus,
  applicationId,
  onUpdateStatus,
  candidateName,
  size = 'sm',
  variant = 'outline',
  className = ''
}) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  
  const config = statusConfig[targetStatus];
  const Icon = config.icon;
  
  // Don't show button if already in target status
  if (currentStatus === targetStatus) {
    return null;
  }

  const handleStatusUpdate = async () => {
    setLoading(true);
    try {
      await onUpdateStatus(applicationId, targetStatus);
      toast.success(`${candidateName} has been ${targetStatus}`);
      setOpen(false);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(`Failed to update status to ${targetStatus}`);
    }
    setLoading(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant={targetStatus === 'rejected' ? 'destructive' : variant}
          size={size}
          className={className}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Icon className="h-4 w-4 mr-2" />
          )}
          {config.label}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {config.label} {candidateName}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {config.description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleStatusUpdate}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            {config.confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
