
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { JobFormValues } from "./formSchema";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { supportedCurrencies } from "@/contexts/CurrencyContext";

interface CompensationSectionProps {
  form: UseFormReturn<JobFormValues>;
}

export const CompensationSection = ({ form }: CompensationSectionProps) => {
  return (
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
                {supportedCurrencies.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    <div className="flex items-center gap-2">
                      <span>{currency.flag}</span>
                      <span>{currency.code}</span>
                      <span className="text-muted-foreground">({currency.symbol})</span>
                      <span className="text-xs text-muted-foreground">{currency.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
