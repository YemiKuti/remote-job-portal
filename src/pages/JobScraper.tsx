
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Job } from "@/types";
import { jobs } from "@/data/jobs";
import { JobScraperFilters } from "@/components/JobScraperFilters";
import { JobScraperResults } from "@/components/JobScraperResults";
import { JobScraperAutomation } from "@/components/JobScraperAutomation";
import { TabsContent, Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ScraperSettings, ScraperResultData } from "@/types/scraper";
import { mockScrapedJobs } from "@/utils/scraper-utils";

const JobScraper = () => {
  const [scrapedJobs, setScrapedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [resultsData, setResultsData] = useState<ScraperResultData | null>(null);
  const [scraperSettings, setScraperSettings] = useState<ScraperSettings>({
    countries: ["USA", "UK", "Canada"],
    keywords: "tech, developer, engineer, Africa, African",
    companyNames: "",
    jobLimit: 20,
    autoExport: false,
    schedule: "daily",
    startDate: undefined,
    endDate: undefined,
    sources: ["LinkedIn", "Indeed", "Glassdoor"],
    jobTypes: ["Full-time"],
    experienceLevels: ["Entry-level", "Mid-level"],
    salaryRange: { min: 0, max: 200000 },
    includeRemote: true,
    includeVisaSponsorship: true,
    exportFormat: "xml"
  });

  const handleScrape = () => {
    setLoading(true);
    toast.info("Starting advanced job scraping process...");
    
    // Simulate scraping process with more advanced parameters
    setTimeout(() => {
      // Use our utility function to get mock data
      const { mockJobs, stats } = mockScrapedJobs(scraperSettings);
      
      setScrapedJobs(mockJobs);
      setResultsData({
        totalResults: mockJobs.length,
        sources: scraperSettings.sources,
        dateScraped: new Date().toISOString(),
        stats: stats
      });
      
      setLoading(false);
      toast.success(`Successfully scraped ${mockJobs.length} jobs from ${scraperSettings.sources.length} sources`);
    }, 2000);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-job-green mb-2">Enhanced Job Scraper Tool</h1>
          <p className="text-gray-600">Advanced scraping with multiple data sources and intelligent filtering</p>
        </div>
        
        <div className="grid md:grid-cols-5 gap-8">
          <div className="md:col-span-2 space-y-6">
            <Tabs defaultValue="filters">
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="filters">Scraper Settings</TabsTrigger>
                <TabsTrigger value="automation">Automation</TabsTrigger>
              </TabsList>
              
              <TabsContent value="filters" className="space-y-6">
                <Card>
                  <CardContent className="pt-6">
                    <JobScraperFilters 
                      settings={scraperSettings}
                      setSettings={setScraperSettings}
                      onScrape={handleScrape}
                      loading={loading}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="automation" className="space-y-6">
                <Card>
                  <CardContent className="pt-6">
                    <JobScraperAutomation
                      settings={scraperSettings}
                      setSettings={setScraperSettings}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="md:col-span-3 space-y-6">
            <JobScraperResults 
              jobs={scrapedJobs} 
              resultsData={resultsData}
              settings={scraperSettings}
              setSettings={setScraperSettings}
            />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default JobScraper;
