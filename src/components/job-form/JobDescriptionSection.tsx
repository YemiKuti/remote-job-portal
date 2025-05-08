
import React, { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { JobFormValues } from "./formSchema";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";

interface JobDescriptionSectionProps {
  form: UseFormReturn<JobFormValues>;
}

export const JobDescriptionSection = ({ form }: JobDescriptionSectionProps) => {
  const [requirement, setRequirement] = useState("");

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

  return (
    <>
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
    </>
  );
};
