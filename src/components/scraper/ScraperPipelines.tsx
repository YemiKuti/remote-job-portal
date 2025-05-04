
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle, XCircle } from "lucide-react";

const pipelineSteps = [
  {
    id: "extract",
    name: "Data Extraction",
    description: "Extract raw job data from sources",
    status: "completed",
    progress: 100
  },
  {
    id: "clean",
    name: "Data Cleaning",
    description: "Clean and normalize raw job data",
    status: "completed",
    progress: 100
  },
  {
    id: "enrich",
    name: "Data Enrichment",
    description: "Add skills, location data, and salary info",
    status: "in_progress",
    progress: 65
  },
  {
    id: "dedupe",
    name: "Deduplication",
    description: "Remove duplicate job listings",
    status: "pending",
    progress: 0
  },
  {
    id: "index",
    name: "Indexing",
    description: "Index job data for search",
    status: "pending",
    progress: 0
  }
];

const normalizers = [
  {
    id: "title",
    name: "Job Title Normalizer",
    description: "Standardizes job titles across sources",
    active: true,
    status: "healthy"
  },
  {
    id: "location",
    name: "Location Normalizer",
    description: "Standardizes and geocodes locations",
    active: true,
    status: "healthy"
  },
  {
    id: "salary",
    name: "Salary Normalizer",
    description: "Converts salary formats and currencies",
    active: true,
    status: "warning"
  },
  {
    id: "skills",
    name: "Skills Extractor",
    description: "Uses NLP to extract skills from descriptions",
    active: true,
    status: "warning"
  },
  {
    id: "company",
    name: "Company Enricher",
    description: "Adds company data from external sources",
    active: false,
    status: "error"
  }
];

const ScraperPipelines = () => {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Pipeline Status</CardTitle>
          <CardDescription>Current data processing pipeline steps</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {pipelineSteps.map((step) => (
              <div key={step.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">{step.name}</span>
                    <p className="text-sm text-gray-500">{step.description}</p>
                  </div>
                  <Badge
                    variant={
                      step.status === "completed" 
                        ? "default" 
                        : step.status === "in_progress" 
                          ? "secondary" 
                          : "outline"
                    }
                  >
                    {step.status === "completed" 
                      ? "Complete" 
                      : step.status === "in_progress" 
                        ? "In Progress" 
                        : "Pending"}
                  </Badge>
                </div>
                <Progress value={step.progress} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Normalizers</CardTitle>
          <CardDescription>Active data cleaning and normalization components</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {normalizers.map((normalizer) => (
              <Card key={normalizer.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base font-medium">{normalizer.name}</CardTitle>
                    {normalizer.status === "healthy" ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : normalizer.status === "warning" ? (
                      <Circle className="h-5 w-5 text-yellow-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <CardDescription>{normalizer.description}</CardDescription>
                </CardHeader>
                <CardFooter className="pt-2">
                  <Badge variant={normalizer.active ? "default" : "outline"} className="mt-2">
                    {normalizer.active ? "Active" : "Disabled"}
                  </Badge>
                </CardFooter>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScraperPipelines;
