
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const JobsHeader = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Job Listings</h2>
        <p className="text-muted-foreground">
          Manage your job postings and applications
        </p>
      </div>
      <Button onClick={() => navigate('/employer/jobs/new')}>
        <Plus className="mr-2 h-4 w-4" /> Post New Job
      </Button>
    </div>
  );
};
