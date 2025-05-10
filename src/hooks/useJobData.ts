
import { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { JobFormValues } from "@/components/job-form/formSchema";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useJobData = (
  jobId?: string,
  form?: UseFormReturn<JobFormValues>
) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchJob = async () => {
      if (!jobId || !form) return;
      
      setLoading(true);
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", jobId)
        .single();
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to load job details.",
          variant: "destructive",
        });
        return;
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
      }
      setLoading(false);
    };

    fetchJob();
  }, [jobId, form, toast]);

  return { loading };
};
