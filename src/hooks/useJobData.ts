
import { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { JobFormValues } from "@/components/job-form/formSchema";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { fetchAdminJob } from "@/utils/api/adminApi";

export const useJobData = (
  jobId?: string,
  form?: UseFormReturn<JobFormValues>,
  isAdmin: boolean = false
) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchJob = async () => {
      if (!jobId || !form) return;
      
      setLoading(true);

      try {
        let data;
        
        if (isAdmin) {
          // Use admin function to bypass RLS
          data = await fetchAdminJob(jobId);
        } else {
          // Use regular query for non-admin users (subject to RLS)
          const response = await supabase
            .from("jobs")
            .select("*")
            .eq("id", jobId)
            .single();
          
          if (response.error) {
            throw response.error;
          }
          
          data = response.data;
        }
        
        if (data) {
          // Format application_deadline for the input
          let formattedDate = "";
          if (data.application_deadline) {
            formattedDate = new Date(data.application_deadline).toISOString().split('T')[0];
          }
          
          form.reset({
            ...data,
            application_deadline: formattedDate,
            salary_min: data.salary_min || undefined,
            salary_max: data.salary_max || undefined,
            application_type: data.application_type || "internal",
            application_value: data.application_value || "",
          });
        } else {
          toast({
            title: "Job not found",
            description: "Could not find the requested job.",
            variant: "destructive",
          });
        }
      } catch (error: any) {
        console.error("Error fetching job:", error);
        toast({
          title: "Error",
          description: "Failed to load job details.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId, form, toast, isAdmin]);

  return { loading };
};
