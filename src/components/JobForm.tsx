
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { useNavigate } from "react-router-dom";
import { jobFormSchema, JobFormValues } from "@/components/job-form/formSchema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { BasicInfoSection } from "@/components/job-form/BasicInfoSection";
import { JobDescriptionSection } from "@/components/job-form/JobDescriptionSection";
import { CompensationSection } from "@/components/job-form/CompensationSection";
import { TechStackSection } from "@/components/job-form/TechStackSection";
import { DetailsSection } from "@/components/job-form/DetailsSection";
import { JobPreferencesSection } from "@/components/job-form/JobPreferencesSection";
import { ApplicationMethodSection } from "@/components/job-form/ApplicationMethodSection";
import { JobStatusSection } from "@/components/job-form/JobStatusSection";
import { Separator } from "@/components/ui/separator";

// Props for the component
interface JobFormProps {
  jobId?: string;
  isAdmin?: boolean;
  afterSubmit?: (jobId: string) => void;
}

const JobForm = ({ jobId, isAdmin = false, afterSubmit }: JobFormProps) => {
  const [loading, setLoading] = React.useState(false);
  const { toast } = useToast();
  const { user, session } = useAuth();
  const navigate = useNavigate();

  // Initialize the form with react-hook-form
  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: "",
      company: "",
      location: "",
      description: "",
      requirements: [],
      salary_min: undefined,
      salary_max: undefined,
      salary_currency: "USD",
      employment_type: "",
      experience_level: "",
      tech_stack: [],
      visa_sponsorship: false,
      remote: false,
      company_size: "",
      application_deadline: "",
      logo: "",
      status: "draft",
      application_type: "internal",
      application_value: "",
    },
  });

  // Load job data if editing an existing job
  React.useEffect(() => {
    const fetchJob = async () => {
      if (!jobId) return;
      
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

  // Handle form submission
  const onSubmit = async (values: JobFormValues) => {
    try {
      setLoading(true);
      
      // Transform date string to ISO format if it exists
      const applicationDeadline = values.application_deadline 
        ? new Date(values.application_deadline).toISOString()
        : null;

      if (!user || !session) {
        throw new Error("User not authenticated");
      }

      // Create a properly typed object for Supabase
      const jobData = {
        title: values.title,
        company: values.company,
        location: values.location,
        description: values.description,
        requirements: values.requirements,
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
        // Always use the current user's ID as the employer_id
        employer_id: user.id
      };

      let response;
      
      if (jobId) {
        // Update existing job
        response = await supabase
          .from("jobs")
          .update(jobData)
          .eq("id", jobId);
      } else {
        // Create new job
        response = await supabase
          .from("jobs")
          .insert(jobData)
          .select();
      }

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast({
        title: jobId ? "Job Updated" : "Job Created",
        description: jobId 
          ? "The job has been updated successfully." 
          : "Your job has been created and is pending approval.",
      });

      // Call afterSubmit callback if provided, otherwise navigate
      if (afterSubmit && response.data && response.data[0]) {
        afterSubmit(response.data[0].id);
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

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <BasicInfoSection form={form} />
            
            <JobDescriptionSection form={form} />
            
            <Separator />
            
            <CompensationSection form={form} />
            
            <TechStackSection form={form} />
            
            <DetailsSection form={form} />
            
            <Separator />
            
            <JobPreferencesSection form={form} />
            
            <Separator />
            
            <ApplicationMethodSection form={form} />
            
            {isAdmin && (
              <JobStatusSection form={form} />
            )}
            
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
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default JobForm;
