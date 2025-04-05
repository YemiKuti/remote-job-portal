
import { useState } from "react";
import { SearchFilters } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface AdvancedFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: SearchFilters) => void;
}

const AdvancedFilters = ({ isOpen, onClose, onApplyFilters }: AdvancedFiltersProps) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    location: "",
    experienceLevel: "",
    visaSponsorship: null,
    companySize: "",
    employmentType: "",
    techStack: [],
    minSalary: null,
    hideKeywords: [],
  });

  const [techInput, setTechInput] = useState("");
  const [hideKeywordInput, setHideKeywordInput] = useState("");

  const handleAddTechStack = () => {
    if (techInput.trim() && !filters.techStack.includes(techInput.trim())) {
      setFilters({
        ...filters,
        techStack: [...filters.techStack, techInput.trim()],
      });
      setTechInput("");
    }
  };

  const handleRemoveTechStack = (tech: string) => {
    setFilters({
      ...filters,
      techStack: filters.techStack.filter((t) => t !== tech),
    });
  };

  const handleAddHideKeyword = () => {
    if (hideKeywordInput.trim() && !filters.hideKeywords.includes(hideKeywordInput.trim())) {
      setFilters({
        ...filters,
        hideKeywords: [...filters.hideKeywords, hideKeywordInput.trim()],
      });
      setHideKeywordInput("");
    }
  };

  const handleRemoveHideKeyword = (keyword: string) => {
    setFilters({
      ...filters,
      hideKeywords: filters.hideKeywords.filter((k) => k !== keyword),
    });
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Advanced Search</h2>
            <Button variant="ghost" onClick={onClose} size="icon">
              <X />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="query">Keywords</Label>
                <Input
                  id="query"
                  placeholder="Job title, skills, etc."
                  value={filters.query}
                  onChange={(e) => setFilters({ ...filters, query: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="Country, region, etc."
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="experience">Experience Level</Label>
                <Select
                  value={filters.experienceLevel}
                  onValueChange={(value) => setFilters({ ...filters, experienceLevel: value })}
                >
                  <SelectTrigger id="experience">
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-levels">All Levels</SelectItem>
                    <SelectItem value="Entry-level">Entry-level</SelectItem>
                    <SelectItem value="Mid-level">Mid-level</SelectItem>
                    <SelectItem value="Senior">Senior</SelectItem>
                    <SelectItem value="Lead">Lead/Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="employment-type">Employment Type</Label>
                <Select
                  value={filters.employmentType}
                  onValueChange={(value) => setFilters({ ...filters, employmentType: value })}
                >
                  <SelectTrigger id="employment-type">
                    <SelectValue placeholder="Select employment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-types">All Types</SelectItem>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                    <SelectItem value="Freelance">Freelance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="company-size">Company Size</Label>
                <Select
                  value={filters.companySize}
                  onValueChange={(value) => setFilters({ ...filters, companySize: value })}
                >
                  <SelectTrigger id="company-size">
                    <SelectValue placeholder="Select company size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-sizes">All Sizes</SelectItem>
                    <SelectItem value="Startup">Startup</SelectItem>
                    <SelectItem value="Small">Small</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Large">Large</SelectItem>
                    <SelectItem value="Enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="min-salary">Minimum Salary</Label>
                <Input
                  id="min-salary"
                  type="number"
                  placeholder="Enter minimum salary"
                  value={filters.minSalary || ""}
                  onChange={(e) => setFilters({ ...filters, minSalary: e.target.value ? Number(e.target.value) : null })}
                />
              </div>

              <div className="flex items-center space-x-2 py-2">
                <Switch
                  id="visa-sponsorship"
                  checked={filters.visaSponsorship === true}
                  onCheckedChange={(checked) =>
                    setFilters({ ...filters, visaSponsorship: checked ? true : null })
                  }
                />
                <Label htmlFor="visa-sponsorship">Visa Sponsorship</Label>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="space-y-6">
            <div>
              <Label htmlFor="tech-stack">Tech Stack</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="tech-stack"
                  placeholder="Add technology..."
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTechStack())}
                />
                <Button type="button" onClick={handleAddTechStack}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {filters.techStack.map((tech) => (
                  <Badge key={tech} variant="secondary" className="flex items-center gap-1">
                    {tech}
                    <X
                      size={14}
                      className="cursor-pointer"
                      onClick={() => handleRemoveTechStack(tech)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="hide-keywords">Hide Keywords</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="hide-keywords"
                  placeholder="Add keyword to hide..."
                  value={hideKeywordInput}
                  onChange={(e) => setHideKeywordInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddHideKeyword())}
                />
                <Button type="button" onClick={handleAddHideKeyword}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {filters.hideKeywords.map((keyword) => (
                  <Badge key={keyword} variant="secondary" className="flex items-center gap-1">
                    {keyword}
                    <X
                      size={14}
                      className="cursor-pointer"
                      onClick={() => handleRemoveHideKeyword(keyword)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleApply} className="bg-job-blue hover:bg-job-darkBlue">
              Apply Filters
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedFilters;
