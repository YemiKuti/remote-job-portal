
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { JobFormValues } from "./formSchema";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ExternalLink, Mail, Phone } from "lucide-react";

interface ApplicationMethodSectionProps {
  form: UseFormReturn<JobFormValues>;
}

export const ApplicationMethodSection = ({ form }: ApplicationMethodSectionProps) => {
  // Application type handler
  const applicationType = form.watch("application_type");

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Application Method</h3>

      <FormField
        control={form.control}
        name="application_type"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>How should candidates apply?</FormLabel>
            <FormControl>
              <RadioGroup 
                onValueChange={field.onChange} 
                value={field.value} 
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="internal" id="internal" />
                  <label
                    htmlFor="internal" 
                    className="flex items-center text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Internal (Apply through our platform)
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="external" id="external" />
                  <label
                    htmlFor="external"
                    className="flex items-center text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    <ExternalLink className="mr-1 h-4 w-4" /> External website
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="email" id="email" />
                  <label
                    htmlFor="email"
                    className="flex items-center text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    <Mail className="mr-1 h-4 w-4" /> Email
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="phone" id="phone" />
                  <label
                    htmlFor="phone"
                    className="flex items-center text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    <Phone className="mr-1 h-4 w-4" /> Phone
                  </label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {applicationType !== "internal" && (
        <FormField
          control={form.control}
          name="application_value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {applicationType === "external" && "Application URL"}
                {applicationType === "email" && "Email Address"}
                {applicationType === "phone" && "Phone Number"}
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder={
                    applicationType === "external" ? "https://yourcompany.com/apply" :
                    applicationType === "email" ? "jobs@yourcompany.com" :
                    applicationType === "phone" ? "+12345678901" : ""
                  } 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                {applicationType === "external" && "The URL where candidates will be redirected to apply"}
                {applicationType === "email" && "Email address where applications will be sent"}
                {applicationType === "phone" && "Phone number candidates should call to apply"}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
};
