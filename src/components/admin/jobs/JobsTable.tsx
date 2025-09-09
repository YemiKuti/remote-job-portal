
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { JobStatusBadge } from "./JobStatusBadge";
import { JobActions } from "./JobActions";

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

interface JobsTableProps {
  jobs: JobData[];
  loading: boolean;
  onJobAction: () => void;
}

export const JobsTable = ({ jobs, loading, onJobAction }: JobsTableProps) => {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No jobs found. Try a different search term.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Company</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Salary</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Applications</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {jobs.map((job) => (
          <TableRow key={job.id} className="hover:bg-muted/50">
            <TableCell className="font-medium">
              <div className="max-w-xs">
                <div className="font-semibold text-foreground">{job.title}</div>
                {job.description && (
                  <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {job.description.substring(0, 100)}...
                  </div>
                )}
              </div>
            </TableCell>
            <TableCell className="font-medium">{job.company}</TableCell>
            <TableCell>{job.location}</TableCell>
            <TableCell>
              {job.salary_min && job.salary_max ? (
                <div className="text-sm">
                  <span className="font-medium">
                    {job.salary_currency || 'USD'} {job.salary_min?.toLocaleString()} - {job.salary_max?.toLocaleString()}
                  </span>
                </div>
              ) : (
                <span className="text-muted-foreground">Not specified</span>
              )}
            </TableCell>
            <TableCell>
              {job.application_value ? (
                <div className="text-sm">
                  {job.application_value.includes('@') ? (
                    <a 
                      href={`mailto:${job.application_value}`}
                      className="text-primary hover:underline"
                    >
                      {job.application_value}
                    </a>
                  ) : (
                    <span className="text-foreground">{job.application_value}</span>
                  )}
                </div>
              ) : (
                <span className="text-muted-foreground">Internal</span>
              )}
            </TableCell>
            <TableCell>
              <JobStatusBadge status={job.status} />
            </TableCell>
            <TableCell>{job.applications || 0}</TableCell>
            <TableCell className="text-right">
              <JobActions 
                job={job}
                onJobAction={onJobAction}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
