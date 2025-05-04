import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { useNavigate } from "react-router-dom";

import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription 
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";

// Define the form schema with Zod
const jobFormSchema = z.object({
  title: z.string().min(5, {
    message: "Job title must be at least 5 characters.",
  }),
  company: z.string().min(2, {
    message: "Company name must be at least 2 characters.",
  }),
  location: z.string().min(2, {
    message: "Location must be at least 2 characters.",
  }),
  description: z.string().min(20, {
    message: "Job description must be at least 20 characters.",
  }),
  requirements: z.array(z.string()).min(1, {
    message: "Add at least one requirement.",
  }),
  salary_min: z.number().int().min(0).optional(),
  salary_max: z.number().int().min(0).optional(),
  salary_currency: z.string().default("USD"),
  employment_type: z.string().min(1, {
    message: "Employment type is required.",
  }),
  experience_level: z.string().min(1, {
    message: "Experience level is required.",
  }),
  tech_stack: z.array(z.string()),
  visa_sponsorship: z.boolean().default(false),
  remote: z.boolean().default(false),
  company_size: z.string().optional(),
  application_deadline: z.string().optional(),
  logo: z.string().optional(),
  status: z.string().default("draft")
});

type JobFormValues = z.infer<typeof jobFormSchema>;

// Props for the component
interface JobFormProps {
  jobId?: string;
  isAdmin?: boolean;
  afterSubmit?: (jobId: string) => void;
}

export const JobForm = ({ jobId, isAdmin = false, afterSubmit }: JobFormProps) => {
  const [loading, setLoading] = React.useState(false);
  const [requirement, setRequirement] = React.useState("");
  const [techSkill, setTechSkill] = React.useState("");
  const { toast } = useToast();
  const { user } = useAuth();
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
      status: "draft"
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
      const formattedValues = {
        ...values,
        application_deadline: values.application_deadline 
          ? new Date(values.application_deadline).toISOString()
          : null
      };

      // Create an object with the data that will be saved to Supabase
      const jobData = {
        ...formattedValues,
        employer_id: user?.id
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

  // Handlers for requirements and tech stack
  const addRequirement = () => {
    if (requirement.trim() === "") return;
    const currentRequirements = form.getValues("requirements") || [];
    form.setValue("requirements", [...currentRequirements, requirement.trim()]);
    setRequirement("");
  };

  const removeRequirement = (index: number) => {
    const currentRequirements = form.getValues("requirements") || [];
    form.setValue("requirements", 
      currentRequirements.filter((_, i) => i !== index)
    );
  };

  const addTechSkill = () => {
    if (techSkill.trim() === "") return;
    const currentTechStack = form.getValues("tech_stack") || [];
    form.setValue("tech_stack", [...currentTechStack, techSkill.trim()]);
    setTechSkill("");
  };

  const removeTechSkill = (index: number) => {
    const currentTechStack = form.getValues("tech_stack") || [];
    form.setValue("tech_stack", 
      currentTechStack.filter((_, i) => i !== index)
    );
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title*</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Senior React Developer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Tech Solutions Ltd" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location*</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Nairobi, Kenya or Remote" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="employment_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employment Type*</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select employment type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Full-time">Full-time</SelectItem>
                        <SelectItem value="Part-time">Part-time</SelectItem>
                        <SelectItem value="Contract">Contract</SelectItem>
                        <SelectItem value="Freelance">Freelance</SelectItem>
                        <SelectItem value="Internship">Internship</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Description*</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the job responsibilities, benefits, and other relevant information"
                      className="min-h-[150px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel>Job Requirements*</FormLabel>
              <div className="flex mt-2 mb-2">
                <Input
                  placeholder="Add a requirement"
                  value={requirement}
                  onChange={(e) => setRequirement(e.target.value)}
                  className="mr-2"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addRequirement();
                    }
                  }}
                />
                <Button type="button" onClick={addRequirement}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {form.watch("requirements")?.map((req, index) => (
                  <Badge key={index} variant="secondary" className="px-2 py-1 text-sm">
                    {req}
                    <X 
                      className="ml-1 h-3 w-3 cursor-pointer" 
                      onClick={() => removeRequirement(index)} 
                    />
                  </Badge>
                ))}
              </div>
              {form.formState.errors.requirements && (
                <p className="text-sm font-medium text-destructive mt-2">
                  {form.formState.errors.requirements.message}
                </p>
              )}
            </div>

            <Separator />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <FormField
                control={form.control}
                name="salary_min"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Salary</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="e.g. 50000" 
                        {...field}
                        value={field.value || ''}
                        onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="salary_max"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Salary</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="e.g. 70000" 
                        {...field}
                        value={field.value || ''}
                        onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="salary_currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="KES">KES</SelectItem>
                        <SelectItem value="NGN">NGN</SelectItem>
                        <SelectItem value="ZAR">ZAR</SelectItem>
                        <SelectItem value="GHS">GHS</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <FormLabel>Tech Stack</FormLabel>
              <div className="flex mt-2 mb-2">
                <Input
                  placeholder="Add a technology"
                  value={techSkill}
                  onChange={(e) => setTechSkill(e.target.value)}
                  className="mr-2"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTechSkill();
                    }
                  }}
                />
                <Button type="button" onClick={addTechSkill}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {form.watch("tech_stack")?.map((tech, index) => (
                  <Badge key={index} className="px-2 py-1 text-sm bg-blue-100 text-blue-800 border-blue-300">
                    {tech}
                    <X 
                      className="ml-1 h-3 w-3 cursor-pointer" 
                      onClick={() => removeTechSkill(index)} 
                    />
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="experience_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Experience Level*</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select experience level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Entry-level">Entry-level</SelectItem>
                        <SelectItem value="Mid-level">Mid-level</SelectItem>
                        <SelectItem value="Senior">Senior</SelectItem>
                        <SelectItem value="Lead">Lead</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company_size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Size</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value || ''}
                      value={field.value || ''}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select company size" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Startup">Startup (1-10)</SelectItem>
                        <SelectItem value="Small">Small (11-50)</SelectItem>
                        <SelectItem value="Medium">Medium (51-200)</SelectItem>
                        <SelectItem value="Large">Large (201-1000)</SelectItem>
                        <SelectItem value="Enterprise">Enterprise (1000+)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="application_deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Application Deadline</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="logo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Logo URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/logo.png" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormDescription>
                      Link to your company logo image
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="remote"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Remote Job</FormLabel>
                      <FormDescription>
                        Can this job be performed remotely?
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="visa_sponsorship"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Visa Sponsorship</FormLabel>
                      <FormDescription>
                        Does this job offer visa sponsorship?
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {isAdmin && (
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Status</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                        <SelectItem value="filled">Filled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
