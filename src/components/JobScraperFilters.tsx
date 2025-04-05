
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { format, isAfter, isBefore } from "date-fns";
import { CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ScraperSettings } from "@/types/scraper";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";

interface JobScraperFiltersProps {
  settings: ScraperSettings;
  setSettings: (settings: ScraperSettings) => void;
  onScrape: () => void;
  loading: boolean;
}

export const JobScraperFilters = ({ 
  settings, 
  setSettings,
  onScrape,
  loading
}: JobScraperFiltersProps) => {
  const updateSettings = (newValues: Partial<ScraperSettings>) => {
    setSettings({ ...settings, ...newValues });
  };

  const jobSources = ["LinkedIn", "Indeed", "Glassdoor", "Monster", "CareerBuilder", "ZipRecruiter", "SimplyHired"];
  const jobTypes = ["Full-time", "Part-time", "Contract", "Freelance", "Internship", "Temporary"];
  const experienceLevels = ["Entry-level", "Mid-level", "Senior", "Lead", "Executive"];
  
  return (
    <div className="space-y-6">
      <Accordion type="multiple" defaultValue={["basic", "advanced", "sources"]}>
        <AccordionItem value="basic">
          <AccordionTrigger>Basic Settings</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="keywords">Search Keywords</Label>
                <Textarea 
                  id="keywords"
                  value={settings.keywords}
                  onChange={(e) => updateSettings({ keywords: e.target.value })}
                  placeholder="Enter keywords separated by commas"
                />
                <p className="text-sm text-gray-500">These keywords will be used to filter for Africa-focused jobs</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="companyNames">Company Names</Label>
                <Textarea 
                  id="companyNames"
                  value={settings.companyNames}
                  onChange={(e) => updateSettings({ companyNames: e.target.value })}
                  placeholder="Enter company names separated by commas (e.g., Google, Meta, Microsoft)"
                />
                <p className="text-sm text-gray-500">Filter jobs by specific companies</p>
              </div>

              <div className="space-y-2">
                <Label>Time Period</Label>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="startDate">From</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="startDate"
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !settings.startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {settings.startDate ? format(settings.startDate, "PPP") : <span>Select start date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={settings.startDate}
                          onSelect={(date) => updateSettings({ startDate: date })}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    {settings.startDate && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-xs"
                        onClick={() => updateSettings({ startDate: undefined })}
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="endDate">To</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="endDate"
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !settings.endDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {settings.endDate ? format(settings.endDate, "PPP") : <span>Select end date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={settings.endDate}
                          onSelect={(date) => updateSettings({ endDate: date })}
                          initialFocus
                          className="p-3 pointer-events-auto"
                          disabled={settings.startDate ? (date) => isBefore(date, settings.startDate) : undefined}
                        />
                      </PopoverContent>
                    </Popover>
                    {settings.endDate && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-xs"
                        onClick={() => updateSettings({ endDate: undefined })}
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-500">Filter jobs by posting date range</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="jobLimit">Job Limit</Label>
                <Input
                  id="jobLimit"
                  type="number"
                  min="1"
                  max="500"
                  value={settings.jobLimit}
                  onChange={(e) => updateSettings({ jobLimit: parseInt(e.target.value) })}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="sources">
          <AccordionTrigger>Data Sources</AccordionTrigger>
          <AccordionContent>
            <div>
              <Label htmlFor="countries">Target Countries</Label>
              <div className="flex flex-wrap gap-4 mt-2">
                {["USA", "UK", "Canada", "Germany", "Australia", "South Africa", "Nigeria", "Kenya", "Egypt", "Ghana"].map((country) => (
                  <div key={country} className="flex items-center space-x-2">
                    <Checkbox 
                      id={country} 
                      checked={settings.countries.includes(country)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateSettings({ countries: [...settings.countries, country] });
                        } else {
                          updateSettings({ countries: settings.countries.filter(c => c !== country) });
                        }
                      }}
                    />
                    <Label htmlFor={country}>{country}</Label>
                  </div>
                ))}
              </div>
              
              <div className="mt-4">
                <Label>Job Sources</Label>
                <div className="flex flex-wrap gap-4 mt-2">
                  {jobSources.map((source) => (
                    <div key={source} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`source-${source}`} 
                        checked={settings.sources.includes(source)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            updateSettings({ sources: [...settings.sources, source] });
                          } else {
                            updateSettings({ sources: settings.sources.filter(s => s !== source) });
                          }
                        }}
                      />
                      <Label htmlFor={`source-${source}`}>{source}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="advanced">
          <AccordionTrigger>Advanced Filters</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div>
                <Label>Job Types</Label>
                <div className="flex flex-wrap gap-4 mt-2">
                  {jobTypes.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`jobType-${type}`} 
                        checked={settings.jobTypes.includes(type)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            updateSettings({ jobTypes: [...settings.jobTypes, type] });
                          } else {
                            updateSettings({ jobTypes: settings.jobTypes.filter(t => t !== type) });
                          }
                        }}
                      />
                      <Label htmlFor={`jobType-${type}`}>{type}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <Label>Experience Levels</Label>
                <div className="flex flex-wrap gap-4 mt-2">
                  {experienceLevels.map((level) => (
                    <div key={level} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`expLevel-${level}`} 
                        checked={settings.experienceLevels.includes(level)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            updateSettings({ experienceLevels: [...settings.experienceLevels, level] });
                          } else {
                            updateSettings({ experienceLevels: settings.experienceLevels.filter(l => l !== level) });
                          }
                        }}
                      />
                      <Label htmlFor={`expLevel-${level}`}>{level}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="salaryRange">Salary Range (USD)</Label>
                <div className="pt-6 px-2">
                  <Slider
                    defaultValue={[settings.salaryRange.min, settings.salaryRange.max]}
                    min={0}
                    max={300000}
                    step={10000}
                    onValueChange={(value) => updateSettings({ 
                      salaryRange: { min: value[0], max: value[1] } 
                    })}
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <span>${settings.salaryRange.min.toLocaleString()}</span>
                  <span>${settings.salaryRange.max.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="remote" 
                    checked={settings.includeRemote}
                    onCheckedChange={(checked) => updateSettings({ includeRemote: !!checked })}
                  />
                  <Label htmlFor="remote">Include remote jobs</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="visa" 
                    checked={settings.includeVisaSponsorship}
                    onCheckedChange={(checked) => updateSettings({ includeVisaSponsorship: !!checked })}
                  />
                  <Label htmlFor="visa">Include jobs with visa sponsorship</Label>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="exportFormat">Export Format</Label>
                <Select value={settings.exportFormat} onValueChange={(value) => updateSettings({ exportFormat: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="xml">XML</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Button 
        onClick={onScrape} 
        disabled={loading}
        className="w-full bg-job-green hover:bg-job-darkGreen"
      >
        {loading ? "Scraping..." : "Start Advanced Scraping"}
      </Button>
    </div>
  );
};
