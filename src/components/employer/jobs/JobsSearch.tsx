
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface JobsSearchProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

export const JobsSearch = ({ searchTerm, setSearchTerm }: JobsSearchProps) => {
  return (
    <div className="flex items-center space-x-2">
      <Input 
        placeholder="Search jobs..."
        className="max-w-sm"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <Button variant="outline" size="icon">
        <Search className="h-4 w-4" />
      </Button>
    </div>
  );
};
