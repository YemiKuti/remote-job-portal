
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Job } from "@/types";
import { ScraperSettings, ScraperResultData } from "@/types/scraper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface JobScraperResultsProps {
  jobs: Job[];
  resultsData: ScraperResultData | null;
  settings: ScraperSettings;
  setSettings: (settings: ScraperSettings) => void;
}

export const JobScraperResults = ({ 
  jobs, 
  resultsData,
  settings,
  setSettings 
}: JobScraperResultsProps) => {
  const [selectedTab, setSelectedTab] = useState("results");
  
  const handleExport = () => {
    if (jobs.length === 0) {
      toast.error("No jobs to export. Please scrape jobs first.");
      return;
    }

    let content = "";
    let fileName = `africantechjobs-${new Date().toISOString().slice(0, 10)}`;
    let mimeType = "application/xml";
    
    switch (settings.exportFormat) {
      case "xml":
        content = generateJobsXML(jobs);
        fileName += ".xml";
        break;
      case "json":
        content = JSON.stringify(jobs, null, 2);
        fileName += ".json";
        mimeType = "application/json";
        break;
      case "csv":
        content = generateJobsCSV(jobs);
        fileName += ".csv";
        mimeType = "text/csv";
        break;
      case "excel":
        // For demo, we'll use CSV but with an .xlsx extension
        content = generateJobsCSV(jobs);
        fileName += ".xlsx";
        mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        break;
    }
    
    downloadFile(content, fileName, mimeType);
    toast.success(`Jobs exported as ${settings.exportFormat.toUpperCase()}`);
  };

  const downloadFile = (content: string, fileName: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateJobsXML = (jobsData: Job[]): string => {
    let xml = '<?xml version="1.0" encoding="UTF-8" ?>\n';
    xml += '<jobs>\n';
    
    jobsData.forEach(job => {
      xml += '  <job>\n';
      xml += `    <id>${job.id}</id>\n`;
      xml += `    <title>${job.title}</title>\n`;
      xml += `    <company>${job.company}</company>\n`;
      xml += `    <logo>${job.logo}</logo>\n`;
      xml += `    <location>${job.location}</location>\n`;
      xml += `    <salary>\n`;
      xml += `      <min>${job.salary.min}</min>\n`;
      xml += `      <max>${job.salary.max}</max>\n`;
      xml += `      <currency>${job.salary.currency}</currency>\n`;
      xml += `    </salary>\n`;
      xml += `    <description><![CDATA[${job.description}]]></description>\n`;
      xml += '    <requirements>\n';
      job.requirements.forEach(req => {
        xml += `      <requirement>${req}</requirement>\n`;
      });
      xml += '    </requirements>\n';
      xml += `    <postedDate>${job.postedDate}</postedDate>\n`;
      xml += `    <employmentType>${job.employmentType}</employmentType>\n`;
      xml += `    <experienceLevel>${job.experienceLevel}</experienceLevel>\n`;
      xml += `    <visaSponsorship>${job.visaSponsorship}</visaSponsorship>\n`;
      xml += `    <companySize>${job.companySize}</companySize>\n`;
      xml += '    <techStack>\n';
      job.techStack.forEach(tech => {
        xml += `      <technology>${tech}</technology>\n`;
      });
      xml += '    </techStack>\n';
      xml += `    <remote>${job.remote}</remote>\n`;
      xml += '  </job>\n';
    });
    
    xml += '</jobs>';
    return xml;
  };

  const generateJobsCSV = (jobsData: Job[]): string => {
    const headers = [
      'ID', 'Title', 'Company', 'Location', 'Salary Min', 'Salary Max', 
      'Currency', 'Posted Date', 'Employment Type', 'Experience Level',
      'Visa Sponsorship', 'Company Size', 'Remote'
    ];
    
    let csv = headers.join(',') + '\n';
    
    jobsData.forEach(job => {
      const row = [
        job.id,
        `"${job.title.replace(/"/g, '""')}"`,
        `"${job.company.replace(/"/g, '""')}"`,
        `"${job.location.replace(/"/g, '""')}"`,
        job.salary.min,
        job.salary.max,
        job.salary.currency,
        job.postedDate,
        job.employmentType,
        job.experienceLevel,
        job.visaSponsorship,
        job.companySize,
        job.remote
      ];
      
      csv += row.join(',') + '\n';
    });
    
    return csv;
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Job Insights</h2>
        <div className="flex gap-2">
          <Select 
            value={settings.exportFormat} 
            onValueChange={(value: "json" | "xml" | "csv" | "excel") => setSettings({...settings, exportFormat: value})}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="xml">XML</SelectItem>
              <SelectItem value="json">JSON</SelectItem>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="excel">Excel</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={handleExport}
            disabled={jobs.length === 0}
            variant="outline"
            className="border-job-green text-job-green hover:bg-job-hover"
          >
            Export Data
          </Button>
        </div>
      </div>
      
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="preview">Data Preview</TabsTrigger>
        </TabsList>
        
        <TabsContent value="results">
          {jobs.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center min-h-[300px] text-center p-6">
                <div className="text-center py-10 text-gray-500">
                  No jobs scraped yet. Configure and start the advanced scraper.
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Scraped Jobs ({jobs.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-auto max-h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Salary</TableHead>
                        <TableHead>Posted</TableHead>
                        <TableHead>Source</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {jobs.map((job) => (
                        <TableRow key={job.id}>
                          <TableCell className="font-medium">{job.title}</TableCell>
                          <TableCell>{job.company}</TableCell>
                          <TableCell>{job.location}</TableCell>
                          <TableCell>
                            {job.salary.currency} {job.salary.min.toLocaleString()} - {job.salary.max.toLocaleString()}
                          </TableCell>
                          <TableCell>{new Date(job.postedDate).toLocaleDateString()}</TableCell>
                          <TableCell>
                            {/* For demo purposes, randomly assign a source */}
                            {settings.sources[Math.floor(Math.random() * settings.sources.length)]}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="analytics">
          {!resultsData ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center min-h-[300px] text-center p-6">
                <div className="text-center py-10 text-gray-500">
                  No analytics available. Please scrape jobs first.
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Jobs by Source</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={resultsData.stats.bySource}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#8884d8"
                          label={(entry) => `${entry.name}: ${entry.value}`}
                        >
                          {resultsData.stats.bySource.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Jobs by Experience</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={resultsData.stats.byExperience}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill="#00C49F" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Jobs by Location</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={resultsData.stats.byLocation}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill="#FFBB28" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Jobs by Salary Range</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={resultsData.stats.bySalary}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill="#8884D8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>Data Export Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {jobs.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  No data to preview. Scrape jobs first.
                </div>
              ) : (
                <pre className="bg-gray-50 p-4 rounded overflow-auto max-h-[500px] text-xs">
                  {settings.exportFormat === 'xml' && (
                    generateJobsXML(jobs.slice(0, 1)).split("\n").map((line, i) => (
                      <div key={i} className="whitespace-pre">{line}</div>
                    ))
                  )}
                  {settings.exportFormat === 'json' && (
                    JSON.stringify(jobs.slice(0, 1), null, 2)
                  )}
                  {settings.exportFormat === 'csv' && (
                    generateJobsCSV(jobs.slice(0, 1))
                  )}
                  {settings.exportFormat === 'excel' && (
                    <div>
                      <p>Excel format preview (CSV-based):</p>
                      {generateJobsCSV(jobs.slice(0, 1))}
                    </div>
                  )}
                  <div className="text-gray-500 mt-2">... and {jobs.length - 1} more jobs</div>
                </pre>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
