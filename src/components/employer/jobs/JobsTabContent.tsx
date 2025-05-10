
import React from "react";
import { JobListingItem } from "./JobListingItem";

interface Job {
  id: string;
  title: string;
  applications: number | null;
  views: number | null;
  created_at: string | null;
  status: string;
}

interface JobsTabContentProps {
  jobs: Job[];
  loading: boolean;
  emptyMessage: string;
  onJobAction: (jobId: string, action: string) => void;
  showPublishButton?: boolean;
  showDeleteButton?: boolean;
  showReactivateButton?: boolean;
  showViewApplicants?: boolean;
}

export const JobsTabContent = ({ 
  jobs, 
  loading, 
  emptyMessage, 
  onJobAction,
  showPublishButton = false,
  showDeleteButton = false,
  showReactivateButton = false,
  showViewApplicants = true,
}: JobsTabContentProps) => {
  if (loading) {
    return <p>Loading jobs...</p>;
  }
  
  if (jobs.length === 0) {
    return <p className="text-center py-4 text-muted-foreground">{emptyMessage}</p>;
  }
  
  return (
    <div className="space-y-4">
      {jobs.map(job => (
        <JobListingItem 
          key={job.id} 
          job={job} 
          onAction={onJobAction}
          showPublishButton={showPublishButton}
          showDeleteButton={showDeleteButton}
          showReactivateButton={showReactivateButton}
          showViewApplicants={showViewApplicants}
        />
      ))}
    </div>
  );
};
