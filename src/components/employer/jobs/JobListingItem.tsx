
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { JobStatusBadge } from "./JobStatusBadge";
import { JobExpirationBadge } from "./JobExpirationBadge";
import { Eye, Users, Edit, Trash2, Play, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";

interface Job {
  id: string;
  title: string;
  applications: number | null;
  views: number | null;
  created_at: string | null;
  status: string;
  expires_at?: string | null;
  posted_at?: string | null;
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
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-lg">{job.title}</CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <JobStatusBadge status={job.status} />
              <JobExpirationBadge expiresAt={job.expires_at || null} status={job.status} />
            </div>
          </div>
          <div className="flex gap-2">
            <Link to={`/employer/jobs/${job.id}/edit`}>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </Link>
            {showViewApplicants && (
              <Link to={`/employer/candidates?job=${job.id}`}>
                <Button variant="outline" size="sm">
                  <Users className="h-4 w-4 mr-1" />
                  View Applicants
                </Button>
              </Link>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Applications</p>
            <p className="font-medium">{job.applications || 0}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Views</p>
            <p className="font-medium">{job.views || 0}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Created</p>
            <p className="font-medium">{formatDate(job.created_at)}</p>
          </div>
          {job.posted_at && (
            <div>
              <p className="text-muted-foreground">Posted</p>
              <p className="font-medium">{formatDate(job.posted_at)}</p>
            </div>
          )}
        </div>
        
        <div className="flex gap-2 mt-4">
          {showPublishButton && (
            <Button 
              onClick={() => onAction(job.id, 'publish')}
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              <Play className="h-4 w-4 mr-1" />
              Publish
            </Button>
          )}
          
          {showReactivateButton && (
            <Button 
              onClick={() => onAction(job.id, 'reactivate')}
              size="sm"
              variant="outline"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Reactivate
            </Button>
          )}
          
          {job.status === 'active' && (
            <Button 
              onClick={() => onAction(job.id, 'close')}
              variant="outline"
              size="sm"
            >
              Close Job
            </Button>
          )}
          
          {showDeleteButton && (
            <Button 
              onClick={() => onAction(job.id, 'delete')}
              variant="destructive"
              size="sm"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
