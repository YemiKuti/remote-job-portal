
import React from "react";
import { Button } from "@/components/ui/button";
import { Eye, CheckCircle, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface JobActionsProps {
  jobId: string;
  status: string;
  onJobAction: (jobId: string, action: string) => Promise<void>;
}

export const JobActions = ({ jobId, status, onJobAction }: JobActionsProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex">
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8"
        onClick={() => navigate(`/admin/edit-job/${jobId}`)}
      >
        <Eye className="h-4 w-4" />
      </Button>
      
      {status === 'pending' && (
        <>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-green-600"
            onClick={() => onJobAction(jobId, 'approve')}
          >
            <CheckCircle className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-red-600"
            onClick={() => onJobAction(jobId, 'reject')}
          >
            <XCircle className="h-4 w-4" />
          </Button>
        </>
      )}
      
      {status !== 'pending' && (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate(`/admin/edit-job/${jobId}`)}
        >
          Edit
        </Button>
      )}
    </div>
  );
};
