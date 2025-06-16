
import React from "react";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { JobFormValues } from "./formSchema";
import RichTextEditor from "@/components/blog/RichTextEditor";

interface JobDescriptionSectionProps {
  form: UseFormReturn<JobFormValues>;
}

export const JobDescriptionSection = ({ form }: JobDescriptionSectionProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Job Description</h3>
        <p className="text-sm text-muted-foreground">
          Provide detailed information about the role and requirements using rich formatting
        </p>
      </div>

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Job Description *</FormLabel>
            <FormControl>
              <RichTextEditor
                value={field.value}
                onChange={field.onChange}
                placeholder="## About the Role

Describe the position, key responsibilities, and what makes this opportunity exciting...

### Key Responsibilities
- Lead development of new features
- Collaborate with cross-functional teams
- Mentor junior developers

### What We Offer
- Competitive salary and benefits
- Remote-first culture
- Professional development opportunities"
                className="min-h-[350px]"
              />
            </FormControl>
            <FormDescription>
              Use **bold**, *italic*, headers (## Header), bullet points, and other formatting to create an engaging job description. Include responsibilities, company culture, and benefits.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="requirements"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Requirements *</FormLabel>
            <FormControl>
              <RichTextEditor
                value={Array.isArray(field.value) ? field.value.join('\n\n') : field.value || ''}
                onChange={(value) => {
                  // Store as rich text string instead of converting to array
                  // This preserves formatting while still being compatible with the backend
                  field.onChange(value);
                }}
                placeholder="## Required Qualifications

### Technical Skills
- **3+ years** of experience with React and TypeScript
- Experience with modern frontend tooling (Vite, Webpack)
- Knowledge of state management (Redux, Zustand)

### Soft Skills
- Strong communication skills
- Experience working in agile environments
- Problem-solving mindset

### Nice to Have
- Experience with Node.js
- DevOps knowledge (Docker, CI/CD)
- Open source contributions"
                className="min-h-[250px]"
              />
            </FormControl>
            <FormDescription>
              List the essential and preferred qualifications. Use formatting like **bold** for important skills, bullet points for lists, and headers (###) to organize different requirement categories.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
