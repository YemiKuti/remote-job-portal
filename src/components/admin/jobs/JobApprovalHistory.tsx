
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, User, Calendar, MessageSquare, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { getJobApprovalHistory, ApprovalHistoryEntry } from '@/utils/api/adminApi';
import { useToast } from '@/hooks/use-toast';

interface JobApprovalHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  job: {
    id: string;
    title: string;
    company: string;
  } | null;
}

export const JobApprovalHistory = ({ isOpen, onClose, job }: JobApprovalHistoryProps) => {
  const [history, setHistory] = useState<ApprovalHistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && job) {
      fetchHistory();
    }
  }, [isOpen, job]);

  const fetchHistory = async () => {
    if (!job) return;

    setLoading(true);
    try {
      const historyData = await getJobApprovalHistory(job.id);
      setHistory(historyData);
    } catch (error: any) {
      console.error('Error fetching approval history:', error);
      toast({
        title: 'Error',
        description: 'Failed to load approval history',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'approve':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'reject':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'approve':
        return 'bg-green-100 text-green-800';
      case 'reject':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (!job) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Approval History
          </DialogTitle>
          <DialogDescription>
            Review the approval history for "{job.title}" from {job.company}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-96">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Clock className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2">Loading history...</span>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No approval history found for this job.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((entry, index) => (
                <div key={entry.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getActionIcon(entry.action)}
                      <Badge className={getActionColor(entry.action)}>
                        {entry.action.charAt(0).toUpperCase() + entry.action.slice(1)}
                      </Badge>
                      {entry.previous_status && entry.new_status && (
                        <span className="text-sm text-muted-foreground">
                          {entry.previous_status} → {entry.new_status}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {formatDate(entry.performed_at)}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                    <User className="h-3 w-3" />
                    {entry.performer_name || 'Unknown User'}
                  </div>

                  {entry.reason && (
                    <div className="mb-2">
                      <p className="text-sm font-medium mb-1">Reason:</p>
                      <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                        {entry.reason}
                      </p>
                    </div>
                  )}

                  {entry.notes && (
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <MessageSquare className="h-3 w-3" />
                        <p className="text-sm font-medium">Notes:</p>
                      </div>
                      <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                        {entry.notes}
                      </p>
                    </div>
                  )}

                  {index < history.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
