
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface FormButtonsProps {
  isAdmin: boolean;
  loading: boolean;
  jobId?: string;
}

export const FormButtons = ({ isAdmin, loading, jobId }: FormButtonsProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex justify-end gap-4">
      <Button 
        type="button" 
        variant="outline" 
        onClick={() => isAdmin ? navigate('/admin/jobs') : navigate('/employer/jobs')}
        disabled={loading}
      >
        Cancel
      </Button>
      <Button type="submit" disabled={loading}>
        {jobId ? 'Update Job' : 'Create Job'}
      </Button>
    </div>
  );
};
