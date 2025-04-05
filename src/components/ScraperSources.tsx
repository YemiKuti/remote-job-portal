
import { useState } from "react";
import { Check, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { JobScrapingSource, ScraperSettings } from "@/types/scraper";
import { toast } from "sonner";

interface ScraperSourcesProps {
  settings: ScraperSettings;
  setSettings: (settings: ScraperSettings) => void;
}

// Data sources available for job scraping
const AVAILABLE_SOURCES: JobScrapingSource[] = [
  {
    id: "linkedin",
    name: "LinkedIn",
    url: "https://www.linkedin.com/jobs",
    logo: "/placeholder.svg",
    features: ["Profile matching", "Premium job listings", "Company insights"],
    supported: true
  },
  {
    id: "indeed",
    name: "Indeed",
    url: "https://www.indeed.com",
    logo: "/placeholder.svg",
    features: ["Salary estimates", "High volume", "Review data"],
    supported: true
  },
  {
    id: "glassdoor",
    name: "Glassdoor",
    url: "https://www.glassdoor.com",
    logo: "/placeholder.svg",
    features: ["Company reviews", "Interview questions", "Salary data"],
    supported: true
  },
  {
    id: "stackoverflow",
    name: "Stack Overflow Jobs",
    url: "https://stackoverflow.com/jobs",
    logo: "/placeholder.svg",
    features: ["Tech focus", "Remote options", "Developer tools"],
    supported: true
  },
  {
    id: "remoteok",
    name: "RemoteOK",
    url: "https://remoteok.com",
    logo: "/placeholder.svg",
    features: ["Remote only", "Tech focused", "Startup culture"],
    supported: true
  },
  {
    id: "wellfound",
    name: "Wellfound (AngelList)",
    url: "https://wellfound.com",
    logo: "/placeholder.svg",
    features: ["Startup focus", "Equity details", "Funding info"],
    supported: true
  },
  {
    id: "simplyhired",
    name: "Simply Hired",
    url: "https://www.simplyhired.com",
    logo: "/placeholder.svg",
    features: ["Diverse listings", "Location focus", "Email alerts"],
    supported: false
  },
  {
    id: "ziprecruiter",
    name: "ZipRecruiter",
    url: "https://www.ziprecruiter.com",
    logo: "/placeholder.svg",
    features: ["AI matching", "One-click apply", "Employer messages"],
    supported: false
  }
];

export const ScraperSources = ({ settings, setSettings }: ScraperSourcesProps) => {
  const updateSelectedSources = (sourceName: string, isChecked: boolean) => {
    let updatedSources = [...settings.sources];
    
    if (isChecked) {
      if (!updatedSources.includes(sourceName)) {
        updatedSources.push(sourceName);
      }
    } else {
      updatedSources = updatedSources.filter(source => source !== sourceName);
    }
    
    setSettings({
      ...settings,
      sources: updatedSources
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Job Scraping Sources</h3>
        <p className="text-sm text-gray-500 mb-4">
          Select the job boards and platforms to include in your scraping operation
        </p>
        
        <div className="grid grid-cols-1 gap-4">
          {AVAILABLE_SOURCES.map((source) => (
            <Card key={source.id} className={source.supported ? "" : "opacity-60"}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id={`source-${source.id}`}
                      checked={settings.sources.includes(source.name)}
                      onCheckedChange={(checked) => {
                        if (source.supported) {
                          updateSelectedSources(source.name, !!checked);
                        } else {
                          toast.info("This source will be available in a future update");
                        }
                      }}
                      disabled={!source.supported}
                    />
                    <Label 
                      htmlFor={`source-${source.id}`}
                      className="font-medium text-base cursor-pointer"
                    >
                      {source.name}
                    </Label>
                  </div>
                  
                  {!source.supported && (
                    <Badge variant="outline" className="text-gray-500">Coming soon</Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="flex flex-wrap gap-2 pt-2">
                  {source.features.map((feature, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              
              <CardFooter className="pt-0 text-xs text-gray-500">
                <a 
                  href={source.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {source.url}
                </a>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
      
      <div className="pt-4 border-t">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Advanced Source Options</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="p-0 h-auto">
                  <Info className="h-4 w-4 text-gray-400" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">These settings help control how the scraper interacts with each source</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="depth-crawling" 
              checked={settings.depthCrawling}
              onCheckedChange={(checked) => 
                setSettings({...settings, depthCrawling: !!checked})
              }
            />
            <Label htmlFor="depth-crawling">Enable depth crawling (follow links to job details)</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="respect-robots" 
              checked={settings.respectRobotsTxt}
              onCheckedChange={(checked) => 
                setSettings({...settings, respectRobotsTxt: !!checked})
              }
            />
            <Label htmlFor="respect-robots">Respect robots.txt rules</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="extract-company-data" 
              checked={settings.extractCompanyData}
              onCheckedChange={(checked) => 
                setSettings({...settings, extractCompanyData: !!checked})
              }
            />
            <Label htmlFor="extract-company-data">Extract additional company data</Label>
          </div>
          
          <Button 
            variant="outline"
            className="w-full mt-2" 
            onClick={() => {
              setSettings({
                ...settings,
                sources: ["LinkedIn", "Indeed", "Glassdoor", "Stack Overflow Jobs"]
              });
              toast.success("Default sources selected");
            }}
          >
            Reset to Default Sources
          </Button>
        </div>
      </div>
    </div>
  );
};
