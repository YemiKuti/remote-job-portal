
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Loader2, Save, CheckCircle, ArrowLeft } from "lucide-react";
import { SponsoredBadge } from "@/components/ui/sponsored-badge";
import { useFormContext } from "react-hook-form";
import { JobFormValues } from "./formSchema";

interface FormButtonsProps {
  isAdmin?: boolean;
  loading?: boolean;
  jobId?: string;
}

export const FormButtons = ({ isAdmin, loading, jobId }: FormButtonsProps) => {
  const navigate = useNavigate();
  const { watch } = useFormContext<JobFormValues>();
  const isSponsored = watch("sponsored");

  const handleCancel = () => {
    if (isAdmin) {
      navigate("/admin/jobs");
    } else {
      navigate("/employer/jobs");
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      {isSponsored && (
        <div className="flex items-center justify-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-center gap-2">
            <SponsoredBadge size="md" />
            <span className="text-sm text-gray-600">
              This job will be marked as sponsored for maximum visibility
            </span>
          </div>
        </div>
      )}
      
      <div className="flex justify-between items-center pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={loading}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Cancel
        </Button>
        
        <div className="flex space-x-2">
          <Button
            type="submit"
            variant="outline"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save as Draft
          </Button>
          
          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4 mr-2" />
            )}
            {jobId ? "Update Job" : "Publish Job"}
          </Button>
        </div>
      </div>
    </div>
  );
};
