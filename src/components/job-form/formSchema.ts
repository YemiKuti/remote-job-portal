
import { z } from "zod";

export const jobFormSchema = z.object({
  title: z.string().min(1, "Job title is required"),
  company: z.string().min(1, "Company name is required"),
  location: z.string().min(1, "Location is required"),
  description: z.string().min(1, "Job description is required"),
  requirements: z.string().min(1, "Requirements are required"), // Changed from array to string
  salary_min: z.number().optional(),
  salary_max: z.number().optional(),
  salary_currency: z.string().default("USD"),
  employment_type: z.string().min(1, "Employment type is required"),
  experience_level: z.string().min(1, "Experience level is required"),
  tech_stack: z.array(z.string()).default([]),
  visa_sponsorship: z.boolean().default(false),
  remote: z.boolean().default(false),
  company_size: z.string().optional(),
  application_deadline: z.string().optional(),
  logo: z.string().optional(),
  status: z.enum(["draft", "active", "inactive", "pending"]).default("draft"),
  application_type: z.enum(["internal", "external", "email", "phone"]).default("internal"),
  application_value: z.string().optional(),
});

export type JobFormValues = z.infer<typeof jobFormSchema>;
