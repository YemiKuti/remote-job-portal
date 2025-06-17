
import React from "react";
import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { JobFormValues } from "./formSchema";
import { SponsoredBadge } from "@/components/ui/sponsored-badge";

interface SponsoredSectionProps {
  form: UseFormReturn<JobFormValues>;
}

export const SponsoredSection = ({ form }: SponsoredSectionProps) => {
  const isSponsored = form.watch("sponsored");

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">Sponsored Listing</h3>
        <p className="text-sm text-muted-foreground">
          Configure whether this job should display the sponsored badge
        </p>
      </div>
      
      <FormField
        control={form.control}
        name="sponsored"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">
                Sponsored Badge
              </FormLabel>
              <FormDescription>
                Display a sponsored badge on this job listing to increase visibility
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
      
      {isSponsored && (
        <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <span className="text-sm text-gray-600">Preview:</span>
          <SponsoredBadge size="sm" />
        </div>
      )}
    </div>
  );
};
