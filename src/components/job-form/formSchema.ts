
import { z } from "zod";

// Define the form schema with Zod
export const jobFormSchema = z.object({
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
  status: z.string().default("draft"),
  application_type: z.string().default("internal"),
  application_value: z.string().optional(),
});

export type JobFormValues = z.infer<typeof jobFormSchema>;
