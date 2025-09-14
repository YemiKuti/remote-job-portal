import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Edit3, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import JobForm from '@/components/JobForm';

interface EditJobDialogProps {
  isOpen: boolean;
  onClose: () => void;
  job: {
    id: string;
    title: string;
    company: string;
    status: string;
  } | null;
  onSuccess: () => void;
}

export const EditJobDialog = ({ 
  isOpen, 
  onClose, 
  job, 
  onSuccess 
}: EditJobDialogProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleClose = () => {
    onClose();
  };

  const handleAfterSubmit = (jobId: string) => {
    toast({
      title: 'Job Updated',
      description: `"${job?.title}" has been updated successfully.`,
    });
    onSuccess();
    handleClose();
  };

  if (!job) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5" />
            Edit Job: {job.title}
          </DialogTitle>
          <DialogDescription>
            Edit job details for "{job.title}" from {job.company}. 
            {job.status === 'pending' && ' You can edit this job before approval.'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <JobForm 
            jobId={job.id}
            isAdmin={true}
            afterSubmit={handleAfterSubmit}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};