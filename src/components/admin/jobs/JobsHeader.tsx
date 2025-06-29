
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const JobsHeader = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold">Job Management</h1>
        <p className="text-muted-foreground">Manage all job listings in the system</p>
      </div>
      <Button className="flex items-center gap-2" onClick={() => navigate('/admin/jobs/new')}>
        <Plus className="h-4 w-4" />
        <span>Create Job</span>
      </Button>
    </div>
  );
};
