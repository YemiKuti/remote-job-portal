import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, Eye, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { JobApprovalDialog } from "./JobApprovalDialog";
import { useState } from "react";

interface JobData {
  id: string;
  title: string;
  company: string;
  location: string;
  created_at: string;
  status: string;
  applications: number;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  application_value?: string;
  description?: string;
}

interface AdminApprovalPanelProps {
  pendingJobs: JobData[];
  onJobAction: () => void;
  loading?: boolean;
}

export const AdminApprovalPanel = ({ pendingJobs, onJobAction, loading = false }: AdminApprovalPanelProps) => {
  const navigate = useNavigate();
  const [selectedJob, setSelectedJob] = useState<JobData | null>(null);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject' | null>(null);

  const openApprovalDialog = (job: JobData, action: 'approve' | 'reject') => {
    setSelectedJob(job);
    setApprovalAction(action);
  };

  const closeApprovalDialog = () => {
    setSelectedJob(null);
    setApprovalAction(null);
  };

  const handleApprovalSuccess = () => {
    closeApprovalDialog();
    onJobAction();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Loading pending jobs...</div>
        </CardContent>
      </Card>
    );
  }

  if (pendingJobs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Job Approval Queue
          </CardTitle>
          <CardDescription>
            Review and approve uploaded job postings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <p className="text-muted-foreground">No pending jobs to review. All jobs are approved!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Job Approval Queue ({pendingJobs.length})
          </CardTitle>
          <CardDescription>
            Review and approve uploaded job postings before they go live
          </CardDescription>
        </CardHeader>
      </Card>

      {pendingJobs.map((job) => (
        <Card key={job.id} className="border-l-4 border-l-orange-400">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{job.title}</h3>
                      <Badge variant="outline" className="text-orange-600 border-orange-300">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending Approval
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-muted-foreground mb-2">
                      <span className="font-medium">{job.company}</span> • {job.location}
                    </div>

                    {job.description && (
                      <div className="text-sm text-foreground bg-muted/30 p-3 rounded-md">
                        <p className="whitespace-pre-line">
                          {job.description.length > 300 
                            ? job.description.substring(0, 300) + '...'
                            : job.description
                          }
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {job.salary_min && job.salary_max && (
                        <span>
                          💰 {job.salary_currency || 'USD'} {job.salary_min.toLocaleString()} - {job.salary_max.toLocaleString()}
                        </span>
                      )}
                      
                      {job.application_value && (
                        <span>
                          📧 {job.application_value.includes('@') ? job.application_value : 'External application'}
                        </span>
                      )}
                      
                      <span>
                        📅 {new Date(job.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/admin/jobs/${job.id}/edit`)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Review
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="text-green-600 border-green-300 hover:bg-green-50"
                  onClick={() => openApprovalDialog(job, 'approve')}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-300 hover:bg-red-50"
                  onClick={() => openApprovalDialog(job, 'reject')}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {selectedJob && approvalAction && (
        <JobApprovalDialog
          isOpen={true}
          onClose={closeApprovalDialog}
          job={selectedJob}
          action={approvalAction}
          onSuccess={handleApprovalSuccess}
        />
      )}
    </div>
  );
};