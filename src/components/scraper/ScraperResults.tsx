import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DownloadCloud, FileJson, File, FileSpreadsheet, Search, Filter } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const sampleResults = Array(15).fill(null).map((_, i) => ({
  id: `job-${i+1}`,
  title: [
    "Software Engineer", 
    "Product Manager", 
    "Data Scientist", 
    "DevOps Engineer", 
    "Frontend Developer"
  ][Math.floor(Math.random() * 5)],
  company: [
    "Google", 
    "Microsoft", 
    "African Bank", 
    "Safaricom", 
    "MTN Group"
  ][Math.floor(Math.random() * 5)],
  location: [
    "Nairobi, Kenya", 
    "Cape Town, South Africa", 
    "Lagos, Nigeria", 
    "Remote (Africa)", 
    "Accra, Ghana"
  ][Math.floor(Math.random() * 5)],
  salary: Math.floor(Math.random() * 50000) + 50000,
  postedDate: new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  source: [
    "LinkedIn", 
    "Indeed", 
    "Glassdoor", 
    "Company Website", 
    "Stack Overflow"
  ][Math.floor(Math.random() * 5)],
  jobType: [
    "Full-time", 
    "Contract", 
    "Part-time", 
    "Freelance"
  ][Math.floor(Math.random() * 4)],
  isValidated: Math.random() > 0.3
}));

interface ScraperResultsProps {
  results?: any[];
}

const ScraperResults = ({ results = sampleResults }: ScraperResultsProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [source, setSource] = useState("all");
  
  const filteredResults = results.filter(job => {
    // Filter by source
    if (source !== "all" && job.source !== source) return false;
    
    // Filter by search query
    if (searchQuery && !`${job.title} ${job.company} ${job.location}`.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Scraped Jobs</CardTitle>
          <CardDescription>View and export job data collected from various sources</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input 
                  className="pl-8" 
                  placeholder="Search jobs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="w-full md:w-1/4">
              <Select value={source} onValueChange={setSource}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                  <SelectItem value="Indeed">Indeed</SelectItem>
                  <SelectItem value="Glassdoor">Glassdoor</SelectItem>
                  <SelectItem value="Company Website">Company Websites</SelectItem>
                  <SelectItem value="Stack Overflow">Stack Overflow</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <FileJson className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <File className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <FileSpreadsheet className="h-4 w-4" />
              </Button>
              <Button className="whitespace-nowrap">
                <DownloadCloud className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
          
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Salary</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium">{job.title}</TableCell>
                    <TableCell>{job.company}</TableCell>
                    <TableCell>{job.location}</TableCell>
                    <TableCell>${job.salary.toLocaleString()}</TableCell>
                    <TableCell>{job.postedDate}</TableCell>
                    <TableCell>{job.source}</TableCell>
                    <TableCell>{job.jobType}</TableCell>
                    <TableCell>
                      <Badge variant={job.isValidated ? "default" : "outline"}>
                        {job.isValidated ? "Validated" : "Pending"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
          
          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-gray-500">
              Showing {filteredResults.length} of {results.length} jobs
            </p>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled>Previous</Button>
              <Button variant="outline" size="sm">1</Button>
              <Button variant="outline" size="sm" disabled>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScraperResults;
