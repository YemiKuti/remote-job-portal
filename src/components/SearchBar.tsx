
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  onAdvancedSearch: () => void;
}

const SearchBar = ({ onSearch, onAdvancedSearch }: SearchBarProps) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl flex flex-col gap-2 sm:flex-row">
      <div className="relative flex-grow">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <Input
          type="text"
          placeholder="Search jobs by title, company, or keyword..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 w-full h-12"
        />
      </div>
      <Button type="submit" className="h-12 px-6 bg-job-green hover:bg-job-darkGreen">
        Search
      </Button>
      <Button 
        type="button" 
        variant="outline"
        onClick={onAdvancedSearch}
        className="h-12 border-job-green text-job-green hover:bg-job-hover hover:text-job-green"
      >
        Filters
      </Button>
    </form>
  );
};

export default SearchBar;
