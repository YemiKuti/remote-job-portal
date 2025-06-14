
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ScraperDashboard from "@/components/scraper/ScraperDashboard";
import { parseXMLJobs } from "@/utils/xmlJobParser"; // Fixed import name
import { ScraperSettings } from "@/types/scraper";

const defaultSettings: ScraperSettings = {
  keywords: "Africa tech, African developer, remote Africa",
  companyNames: "MTN Group, Safaricom, Andela, Flutterwave",
  countries: ["South Africa", "Nigeria", "Kenya", "Ghana", "Egypt"],
  sources: ["LinkedIn", "Indeed", "Glassdoor"],
  jobTypes: ["Full-time", "Contract"],
  experienceLevels: ["Entry-level", "Mid-level", "Senior"],
  salaryRange: { min: 30000, max: 150000 },
  includeRemote: true,
  includeVisaSponsorship: false,
  jobLimit: 100,
  exportFormat: "json",
  depthCrawling: true,
  respectRobotsTxt: true,
  extractCompanyData: true,
  useAI: true,
  aiEnhancement: true,
  similarJobDetection: true,
  companyInfoEnrichment: false,
  semanticSearch: false,
  structuredDataExtraction: true,
  schedule: "daily",
  useProxy: false,
  autoExport: false,
  cleanData: true
};

const JobScraper = () => {
  const [settings, setSettings] = useState<ScraperSettings>(defaultSettings);
  const [loading, setLoading] = useState<boolean>(false);
  const [results, setResults] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [scraperStatus, setScraperStatus] = useState({
    active: false,
    progress: 0,
    startTime: undefined,
    endTime: undefined,
    jobsScraped: 0,
    errors: 0
  });

  const handleScrape = async () => {
    if (settings.sources.length === 0) {
      toast.error("Please select at least one source to scrape");
      return;
    }

    setLoading(true);
    setScraperStatus({
      active: true,
      progress: 0,
      startTime: new Date(),
      endTime: undefined,
      jobsScraped: 0,
      errors: 0
    });

    // Add an initial log
    addLog({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      level: "info",
      source: "scraper",
      message: `Starting job scraper with ${settings.sources.length} sources and keywords: ${settings.keywords}`
    });

    // Simulate scraping progress
    let progress = 0;
    const totalSteps = 20;
    const interval = setInterval(() => {
      progress += 5;
      setScraperStatus(prev => ({
        ...prev,
        progress,
        jobsScraped: Math.floor((progress / 100) * 120)
      }));

      if (progress % 25 === 0) {
        // Add a log every 25% progress
        addLog({
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          level: "info",
          source: settings.sources[Math.floor(Math.random() * settings.sources.length)],
          message: `Scraped ${Math.floor((progress / 100) * 120)} jobs (${progress}% complete)`
        });
      }

      if (progress >= 100) {
        clearInterval(interval);
        finishScraping();
      }
    }, 500);

    // Simulate occasional errors
    setTimeout(() => {
      if (Math.random() > 0.5) {
        addLog({
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          level: "error",
          source: settings.sources[Math.floor(Math.random() * settings.sources.length)],
          message: "Failed to parse job details: Rate limit exceeded"
        });
        
        setScraperStatus(prev => ({
          ...prev,
          errors: prev.errors + 1
        }));
      }
    }, 2500);
  };

  const addLog = (log) => {
    setLogs(prev => [log, ...prev]);
  };

  const finishScraping = () => {
    setLoading(false);
    setScraperStatus(prev => ({
      ...prev,
      active: false,
      endTime: new Date(),
      progress: 100
    }));
    
    // Generate random results
    const mockResults = Array(120).fill(null).map((_, i) => ({
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
      source: settings.sources[Math.floor(Math.random() * settings.sources.length)],
      jobType: [
        "Full-time", 
        "Contract", 
        "Part-time", 
        "Freelance"
      ][Math.floor(Math.random() * 4)],
      isValidated: Math.random() > 0.3
    }));

    setResults(mockResults);
    
    // Final log entry
    addLog({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      level: "info",
      source: "scraper",
      message: `Scraping completed: ${mockResults.length} jobs found with ${scraperStatus.errors} errors`
    });

    toast.success(`Successfully scraped ${mockResults.length} jobs!`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Job Scraper</h1>
            <p className="text-gray-600">
              Configure and manage automated job scraping across multiple platforms
            </p>
          </div>
          
          <ScraperDashboard 
            settings={settings}
            setSettings={setSettings}
            onScrape={handleScrape}
            loading={loading}
            results={results}
            logs={logs}
            scraperStatus={scraperStatus}
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default JobScraper;
