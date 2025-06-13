
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { JobStatusBadge } from "./JobStatusBadge";

interface Job {
  id: string;
  title: string;
  applications: number | null;
  views: number | null;
  created_at: string | null;
  status: string;
}

interface JobListingItemProps {
  job: Job;
  onAction: (jobId: string, action: string) => void;
  showPublishButton?: boolean;
  showDeleteButton?: boolean;
  showReactivateButton?: boolean;
  showViewApplicants?: boolean;
}

export const JobListingItem = ({ 
  job, 
  onAction,
  showPublishButton = false,
  showDeleteButton = false,
  showReactivateButton = false,
  showViewApplicants = true,
}: JobListingItemProps) => {
  const navigate = useNavigate();
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };
  
  const handleViewApplicants = () => {
    navigate(`/employer/candidates?jobId=${job.id}`);
  };
  
  return (
    <div className="flex items-center justify-between border-b pb-4">
      <div>
        <p className="font-medium">{job.title}</p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {job.status && <JobStatusBadge status={job.status} />}
          <p>
            {job.applications !== undefined ? `${job.applications || 0} applications • ` : ''}
            {job.views !== undefined ? `${job.views || 0} views • ` : ''}
            Posted on {formatDate(job.created_at)}
          </p>
        </div>
      </div>
      <div className="flex space-x-2">
        {showViewApplicants && (
          <Button 
            size="sm" 
            variant="outline"
            onClick={handleViewApplicants}
          >
            View Applicants {job.applications !== null && job.applications > 0 && `(${job.applications})`}
          </Button>
        )}
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate(`/employer/edit-job/${job.id}`)}
        >
          Edit
        </Button>
        
        {showPublishButton && (
          <Button 
            size="sm"
            onClick={() => onAction(job.id, 'publish')}
          >
            Publish
          </Button>
        )}
        
        {showDeleteButton && (
          <Button 
            variant="outline" 
            size="sm" 
            className="text-red-500"
            onClick={() => onAction(job.id, 'delete')}
          >
            Delete
          </Button>
        )}
        
        {showReactivateButton && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onAction(job.id, 'reactivate')}
          >
            Reactivate
          </Button>
        )}
      </div>
    </div>
  );
};
