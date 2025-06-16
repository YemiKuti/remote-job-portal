
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { jobFormSchema, JobFormValues } from "@/components/job-form/formSchema";
import { Card, CardContent } from "@/components/ui/card";
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
import { useJobForm } from "@/hooks/useJobForm";
import { useJobData } from "@/hooks/useJobData";
import { FormButtons } from "@/components/job-form/FormButtons";

// Props for the component
interface JobFormProps {
  jobId?: string;
  isAdmin?: boolean;
  afterSubmit?: (jobId: string) => void;
}

const JobForm = ({ jobId, isAdmin = false, afterSubmit }: JobFormProps) => {
  // Initialize the form with react-hook-form
  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: "",
      company: "",
      location: "",
      description: "",
      requirements: "", // Fixed: Changed from [] to ""
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

  // Use our custom hooks
  const { loading: submitting, handleSubmit } = useJobForm({ jobId, isAdmin, afterSubmit });
  const { loading: fetching } = useJobData(jobId, form, isAdmin);
  
  // Combined loading state
  const loading = submitting || fetching;

  // Handle form submission
  const onSubmit = async (values: JobFormValues) => {
    await handleSubmit(values);
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
            
            <FormButtons isAdmin={isAdmin} loading={loading} jobId={jobId} />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default JobForm;
