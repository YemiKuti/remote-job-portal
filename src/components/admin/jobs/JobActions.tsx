
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye, CheckCircle, XCircle, History, MoreHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { JobApprovalDialog } from "./JobApprovalDialog";
import { JobApprovalHistory } from "./JobApprovalHistory";

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
  const [approvalDialog, setApprovalDialog] = useState<{
    isOpen: boolean;
    action: 'approve' | 'reject' | null;
  }>({ isOpen: false, action: null });
  const [historyDialog, setHistoryDialog] = useState(false);
  
  const handleApprovalSuccess = () => {
    onJobAction();
  };

  const openApprovalDialog = (action: 'approve' | 'reject') => {
    setApprovalDialog({ isOpen: true, action });
  };

  const closeApprovalDialog = () => {
    setApprovalDialog({ isOpen: false, action: null });
  };

  return (
    <>
      <div className="flex items-center gap-1">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8"
          onClick={() => navigate(`/admin/edit-job/${job.id}`)}
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
            <DropdownMenuItem onClick={() => navigate(`/admin/edit-job/${job.id}`)}>
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
    </>
  );
};
