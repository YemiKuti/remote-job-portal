
import { useState } from "react";
import { JobFormValues } from "@/components/job-form/formSchema";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { createAdminJob, updateAdminJob } from "@/utils/api/adminApi";
import { useAuth } from "@/components/AuthProvider";
import { useNavigate } from "react-router-dom";

interface UseJobFormProps {
  jobId?: string;
  isAdmin?: boolean;
  afterSubmit?: (jobId: string) => void;
}

export const useJobForm = ({ jobId, isAdmin = false, afterSubmit }: UseJobFormProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user, session } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (values: JobFormValues) => {
    try {
      setLoading(true);
      
      // Transform date string to ISO format if it exists
      const applicationDeadline = values.application_deadline 
        ? new Date(values.application_deadline).toISOString()
        : null;

      if (!user || !session) {
        throw new Error("User not authenticated");
      }

      // Convert requirements string to array for database compatibility
      const processRequirements = (requirements: string): string[] => {
        if (!requirements || requirements.trim() === '') {
          return [];
        }
        
        // Split by common separators and filter out empty items
        return requirements
          .split(/\n+/)
          .map(req => req.trim())
          .filter(req => req.length > 0);
      };

      // Create a properly typed object for the job data
      const jobData = {
        title: values.title,
        company: values.company,
        location: values.location,
        description: values.description,
        requirements: processRequirements(values.requirements),
        salary_min: values.salary_min,
        salary_max: values.salary_max,
        salary_currency: values.salary_currency,
        employment_type: values.employment_type,
        experience_level: values.experience_level,
        tech_stack: values.tech_stack,
        visa_sponsorship: values.visa_sponsorship,
        remote: values.remote,
        company_size: values.company_size,
        application_deadline: applicationDeadline,
        logo: values.logo,
        status: values.status,
        application_type: values.application_type,
        application_value: values.application_value,
        sponsored: values.sponsored,
        employer_id: user.id
      };

      let result;
      
      if (isAdmin) {
        // Use admin functions for job creation/update
        if (jobId) {
          result = await updateAdminJob(jobId, jobData);
        } else {
          result = await createAdminJob(jobData);
        }
      } else {
        // Use regular Supabase operations for non-admin users
        if (jobId) {
          // Update existing job
          const response = await supabase
            .from("jobs")
            .update({
              title: jobData.title,
              company: jobData.company,
              location: jobData.location,
              description: jobData.description,
              requirements: jobData.requirements,
              salary_min: jobData.salary_min,
              salary_max: jobData.salary_max,
              salary_currency: jobData.salary_currency,
              employment_type: jobData.employment_type,
              experience_level: jobData.experience_level,
              tech_stack: jobData.tech_stack,
              visa_sponsorship: jobData.visa_sponsorship,
              remote: jobData.remote,
              company_size: jobData.company_size,
              application_deadline: jobData.application_deadline,
              logo: jobData.logo,
              status: jobData.status,
              application_type: jobData.application_type,
              application_value: jobData.application_value,
              sponsored: jobData.sponsored,
              updated_at: new Date().toISOString()
            })
            .eq("id", jobId);

          if (response.error) {
            throw new Error(response.error.message);
          }
          result = jobId;
        } else {
          // Create new job
          const response = await supabase
            .from("jobs")
            .insert({
              title: jobData.title,
              company: jobData.company,
              location: jobData.location,
              description: jobData.description,
              requirements: jobData.requirements,
              salary_min: jobData.salary_min,
              salary_max: jobData.salary_max,
              salary_currency: jobData.salary_currency,
              employment_type: jobData.employment_type,
              experience_level: jobData.experience_level,
              tech_stack: jobData.tech_stack,
              visa_sponsorship: jobData.visa_sponsorship,
              remote: jobData.remote,
              company_size: jobData.company_size,
              application_deadline: jobData.application_deadline,
              logo: jobData.logo,
              status: jobData.status,
              application_type: jobData.application_type,
              application_value: jobData.application_value,
              sponsored: jobData.sponsored,
              employer_id: jobData.employer_id
            })
            .select();

          if (response.error) {
            throw new Error(response.error.message);
          }
          result = response.data?.[0]?.id;
        }
      }

      // Show appropriate success message based on status
      const isDraft = values.status === "draft";
      const isPending = values.status === "pending";
      
      let successMessage = "";
      if (jobId) {
        successMessage = "The job has been updated successfully.";
      } else if (isDraft) {
        successMessage = "Your job has been saved as a draft.";
      } else if (isPending) {
        successMessage = "Your job has been submitted for approval and will be reviewed by our team.";
      } else {
        successMessage = "Job has been created successfully.";
      }

      toast({
        title: jobId ? "Job Updated" : (isDraft ? "Draft Saved" : "Job Submitted"),
        description: successMessage,
      });

      // Call afterSubmit callback if provided, otherwise navigate
      if (afterSubmit && result) {
        const finalJobId = typeof result === 'string' ? result : result.id || jobId;
        afterSubmit(finalJobId);
      } else {
        // Navigate based on user role
        if (isAdmin) {
          navigate("/admin/jobs");
        } else {
          navigate("/employer/jobs");
        }
      }
    } catch (error: any) {
      console.error("Error submitting job:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save job. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return { 
    loading, 
    handleSubmit 
  };
};
