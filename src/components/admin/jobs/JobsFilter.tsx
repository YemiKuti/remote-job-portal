
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";

interface JobsFilterProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

export const JobsFilter = ({ searchTerm, setSearchTerm }: JobsFilterProps) => {
  return (
    <div className="flex items-center gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search jobs by title, company, or location..." 
          className="pl-8 w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <Button variant="outline">
        <Filter className="mr-2 h-4 w-4" /> Filters
      </Button>
    </div>
  );
};
