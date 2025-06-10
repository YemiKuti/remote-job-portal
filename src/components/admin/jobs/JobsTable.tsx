
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
          <TableHead>Posted Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Applications</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {jobs.map((job) => (
          <TableRow key={job.id}>
            <TableCell className="font-medium">{job.title}</TableCell>
            <TableCell>{job.company}</TableCell>
            <TableCell>{job.location}</TableCell>
            <TableCell>{job.created_at ? new Date(job.created_at).toLocaleDateString() : 'N/A'}</TableCell>
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
