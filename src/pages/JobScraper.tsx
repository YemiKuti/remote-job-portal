
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Job } from "@/types";
import { jobs } from "@/data/jobs";

const JobScraper = () => {
  const [scrapedJobs, setScrapedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [countries, setCountries] = useState<string[]>(["USA", "UK", "Canada"]);
  const [keywords, setKeywords] = useState("tech, developer, engineer, Africa, African");
  const [companyNames, setCompanyNames] = useState("");
  const [jobLimit, setJobLimit] = useState(20);
  const [autoExport, setAutoExport] = useState(false);
  const [schedule, setSchedule] = useState("daily");

  const handleScrape = () => {
    setLoading(true);
    toast.info("Starting job scraping process...");
    
    // Simulate scraping process
    setTimeout(() => {
      // For demo purposes, we'll use the existing jobs data and modify it
      let mockScrapedJobs = [...jobs].map(job => ({
        ...job,
        id: `scraped-${Math.random().toString(36).substring(2, 9)}`,
        postedDate: new Date().toISOString(),
        title: job.title + " (Africa Focus)",
        description: "This is a position specifically targeting African tech talent. " + job.description,
      }));
      
      // Filter by company names if provided
      if (companyNames.trim()) {
        const companyNameList = companyNames.split(',').map(name => name.trim().toLowerCase());
        mockScrapedJobs = mockScrapedJobs.filter(job => 
          companyNameList.some(name => job.company.toLowerCase().includes(name))
        );
      }
      
      setScrapedJobs(mockScrapedJobs);
      setLoading(false);
      toast.success(`Successfully scraped ${mockScrapedJobs.length} jobs`);
    }, 2000);
  };

  const handleExportXML = () => {
    if (scrapedJobs.length === 0) {
      toast.error("No jobs to export. Please scrape jobs first.");
      return;
    }

    const xmlContent = generateJobsXML(scrapedJobs);
    downloadXML(xmlContent);
    toast.success("XML file exported successfully");
  };

  const handleAutomateSetup = () => {
    if (!webhookUrl) {
      toast.error("Please enter a webhook URL for automation");
      return;
    }

    toast.success(`Automation setup complete. Jobs will be scraped ${schedule} and sent to your webhook.`);
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

  const downloadXML = (xmlContent: string) => {
    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `africantechjobs-${new Date().toISOString().slice(0, 10)}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-job-green mb-2">Job Scraper Tool</h1>
          <p className="text-gray-600">Scrape Africa-focused tech job listings from USA, UK, and Canada</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="p-6 border rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Scraper Configuration</h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="countries">Target Countries</Label>
                  <div className="flex flex-wrap gap-4 mt-2">
                    {["USA", "UK", "Canada", "Germany", "Australia"].map((country) => (
                      <div key={country} className="flex items-center space-x-2">
                        <Checkbox 
                          id={country} 
                          checked={countries.includes(country)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setCountries([...countries, country]);
                            } else {
                              setCountries(countries.filter(c => c !== country));
                            }
                          }}
                        />
                        <Label htmlFor={country}>{country}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="keywords">Search Keywords</Label>
                  <Textarea 
                    id="keywords"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="Enter keywords separated by commas"
                  />
                  <p className="text-sm text-gray-500">These keywords will be used to filter for Africa-focused jobs</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="companyNames">Company Names</Label>
                  <Textarea 
                    id="companyNames"
                    value={companyNames}
                    onChange={(e) => setCompanyNames(e.target.value)}
                    placeholder="Enter company names separated by commas (e.g., Google, Meta, Microsoft)"
                  />
                  <p className="text-sm text-gray-500">Filter jobs by specific companies</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="jobLimit">Job Limit</Label>
                  <Input
                    id="jobLimit"
                    type="number"
                    min="1"
                    max="100"
                    value={jobLimit}
                    onChange={(e) => setJobLimit(parseInt(e.target.value))}
                  />
                </div>
                
                <Button 
                  onClick={handleScrape} 
                  disabled={loading}
                  className="w-full bg-job-green hover:bg-job-darkGreen"
                >
                  {loading ? "Scraping..." : "Scrape Jobs Now"}
                </Button>
              </div>
            </div>
            
            <div className="p-6 border rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Automation Setup</h2>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="webhook">Webhook URL</Label>
                  <Input
                    id="webhook"
                    type="text"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://your-server.com/webhook"
                  />
                  <p className="text-sm text-gray-500">Your server endpoint that will receive the XML data</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="schedule">Schedule</Label>
                  <Select value={schedule} onValueChange={setSchedule}>
                    <SelectTrigger id="schedule">
                      <SelectValue placeholder="Select schedule" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="autoExport" 
                    checked={autoExport}
                    onCheckedChange={(checked) => setAutoExport(checked as boolean)}
                  />
                  <Label htmlFor="autoExport">Auto-export to XML after scraping</Label>
                </div>
                
                <Button 
                  onClick={handleAutomateSetup} 
                  variant="outline"
                  className="w-full border-job-green text-job-green hover:bg-job-hover"
                >
                  Setup Automation
                </Button>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="p-6 border rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Scraped Jobs</h2>
                <Button 
                  onClick={handleExportXML}
                  disabled={scrapedJobs.length === 0}
                  variant="outline"
                  className="border-job-green text-job-green hover:bg-job-hover"
                >
                  Export to XML
                </Button>
              </div>
              
              {scrapedJobs.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  No jobs scraped yet. Configure and start the scraper.
                </div>
              ) : (
                <div className="overflow-auto max-h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Posted</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {scrapedJobs.map((job) => (
                        <TableRow key={job.id}>
                          <TableCell className="font-medium">{job.title}</TableCell>
                          <TableCell>{job.company}</TableCell>
                          <TableCell>{job.location}</TableCell>
                          <TableCell>{new Date(job.postedDate).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
            
            <div className="p-6 border rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">XML Preview</h2>
              {scrapedJobs.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  No XML generated yet. Scrape jobs first.
                </div>
              ) : (
                <pre className="bg-gray-50 p-4 rounded overflow-auto max-h-[200px] text-xs">
                  {generateJobsXML(scrapedJobs.slice(0, 1)).split("\n").map((line, i) => (
                    <div key={i} className="whitespace-pre">{line}</div>
                  ))}
                  <div className="text-gray-500 mt-2">... and {scrapedJobs.length - 1} more jobs</div>
                </pre>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default JobScraper;
