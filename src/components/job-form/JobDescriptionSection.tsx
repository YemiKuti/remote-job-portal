
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
          Provide detailed information about the role and requirements
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
                placeholder="Describe the role, responsibilities, and what makes this position exciting..."
                className="min-h-[300px]"
              />
            </FormControl>
            <FormDescription>
              Use rich formatting to create an engaging job description. Include responsibilities, qualifications, and company culture.
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
                placeholder="List the key requirements and qualifications for this position..."
                className="min-h-[200px]"
              />
            </FormControl>
            <FormDescription>
              List the essential skills, experience, and qualifications needed for this role. Use bullet points for better readability.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
