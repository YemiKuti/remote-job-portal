
import React, { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { JobFormValues } from "./formSchema";
import { FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";

interface TechStackSectionProps {
  form: UseFormReturn<JobFormValues>;
}

export const TechStackSection = ({ form }: TechStackSectionProps) => {
  const [techSkill, setTechSkill] = useState("");

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
  );
};
