
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye, CheckCircle, XCircle, History, MoreHorizontal, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { JobApprovalDialog } from "./JobApprovalDialog";
import { JobApprovalHistory } from "./JobApprovalHistory";
import { deleteAdminJob } from "@/utils/api/adminApi";
import { useToast } from "@/hooks/use-toast";

interface JobActionsProps {
  job: {
    id: string;
    title: string;
    company: string;
    status: string;
  };
  onJobAction: () => void;
}

export const JobActions = ({ job, onJobAction }: JobActionsProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [approvalDialog, setApprovalDialog] = useState<{
    isOpen: boolean;
    action: 'approve' | 'reject' | null;
  }>({ isOpen: false, action: null });
  const [historyDialog, setHistoryDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleApprovalSuccess = () => {
    onJobAction();
  };

  const openApprovalDialog = (action: 'approve' | 'reject') => {
    setApprovalDialog({ isOpen: true, action });
  };

  const closeApprovalDialog = () => {
    setApprovalDialog({ isOpen: false, action: null });
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteAdminJob(job.id);
      
      toast({
        title: "Job Deleted",
        description: "The job has been successfully deleted.",
      });
      
      onJobAction();
      setDeleteDialog(false);
    } catch (error: any) {
      console.error('Error deleting job:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete job. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-1">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8"
          onClick={() => navigate(`/admin/jobs/${job.id}/edit`)}
          title="Edit Job"
        >
          <Eye className="h-4 w-4" />
        </Button>
        
        {job.status === 'pending' && (
          <>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
              onClick={() => openApprovalDialog('approve')}
            >
              <CheckCircle className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => openApprovalDialog('reject')}
            >
              <XCircle className="h-4 w-4" />
            </Button>
          </>
        )}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate(`/admin/jobs/${job.id}/edit`)}>
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={() => setHistoryDialog(true)}>
              <History className="h-4 w-4 mr-2" />
              View History
            </DropdownMenuItem>
            
            {job.status !== 'pending' && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => openApprovalDialog('approve')}
                  className="text-green-600"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => openApprovalDialog('reject')}
                  className="text-red-600"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </DropdownMenuItem>
              </>
            )}
            
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => setDeleteDialog(true)}
              className="text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Job
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <JobApprovalDialog
        isOpen={approvalDialog.isOpen}
        onClose={closeApprovalDialog}
        job={job}
        action={approvalDialog.action}
        onSuccess={handleApprovalSuccess}
      />

      <JobApprovalHistory
        isOpen={historyDialog}
        onClose={() => setHistoryDialog(false)}
        job={job}
      />

      <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Job</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{job.title}" at {job.company}? This action cannot be undone and will permanently remove the job listing and all associated applications.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete Job"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
