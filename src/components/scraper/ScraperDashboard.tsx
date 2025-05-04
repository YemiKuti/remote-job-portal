
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScraperSettings } from "@/types/scraper";
import { JobScraperFilters } from "@/components/JobScraperFilters";
import { ScraperSources } from "@/components/ScraperSources";
import ScraperPipelines from "@/components/scraper/ScraperPipelines";
import ScraperLogs from "@/components/scraper/ScraperLogs";
import ScraperResults from "@/components/scraper/ScraperResults";
import ScraperSchedule from "@/components/scraper/ScraperSchedule";

// Create a simple chart component since the chart components aren't available
const SimpleLineChart = ({ data, options, className }: any) => {
  return (
    <div className={`${className} bg-gray-50 flex items-center justify-center p-4 rounded-md`}>
      <div className="text-center text-gray-500">
        <p>Line Chart Visualization</p>
        <p className="text-sm">Data points: {data.datasets[0].data.join(', ')}</p>
      </div>
    </div>
  );
};

const SimpleBarChart = ({ data, options, className }: any) => {
  return (
    <div className={`${className} bg-gray-50 flex items-center justify-center p-4 rounded-md`}>
      <div className="text-center text-gray-500">
        <p>Bar Chart Visualization</p>
        <p className="text-sm">Data points: {data.datasets[0].data.join(', ')}</p>
      </div>
    </div>
  );
};

interface ScraperDashboardProps {
  settings: ScraperSettings;
  setSettings: (settings: ScraperSettings) => void;
  onScrape: () => void;
  loading: boolean;
  results: any[];
  logs: any[];
  scraperStatus: {
    active: boolean;
    progress: number;
    startTime?: Date;
    endTime?: Date;
    jobsScraped: number;
    errors: number;
  };
}

const ScraperDashboard = ({
  settings,
  setSettings,
  onScrape,
  loading,
  results,
  logs,
  scraperStatus
}: ScraperDashboardProps) => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const dummyChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Jobs Scraped',
        data: [65, 78, 90, 81, 56, 120],
        backgroundColor: '#22c55e',
        borderColor: '#16a34a',
      }
    ],
  };
  
  const sourcesChartData = {
    labels: ['LinkedIn', 'Indeed', 'Glassdoor', 'StackOverflow', 'RemoteOK'],
    datasets: [
      {
        label: 'Jobs per Source',
        data: [120, 90, 75, 40, 35],
        backgroundColor: ['#22c55e', '#16a34a', '#15803d', '#166534', '#14532d'],
      }
    ],
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs Scraped</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scraperStatus.jobsScraped}</div>
            <p className="text-xs text-muted-foreground">+12% from last run</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{settings.sources.length}</div>
            <p className="text-xs text-muted-foreground">{settings.sources.slice(0, 2).join(", ")}...</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {scraperStatus.jobsScraped ? 
                Math.round((scraperStatus.errors / scraperStatus.jobsScraped) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">{scraperStatus.errors} errors detected</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${scraperStatus.active ? "bg-green-500" : "bg-gray-300"}`}></div>
              <div className="text-lg font-bold">{scraperStatus.active ? "Active" : "Idle"}</div>
            </div>
            {scraperStatus.active && (
              <div className="mt-2">
                <Progress value={scraperStatus.progress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">{scraperStatus.progress}% complete</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full mb-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="sources">Sources</TabsTrigger>
          <TabsTrigger value="pipelines">Pipelines</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Job scraping activity over time</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <SimpleLineChart 
                  data={dummyChartData} 
                  options={{
                    responsive: true,
                    plugins: { legend: { position: 'top' } },
                  }}
                  className="aspect-[4/3]"
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Jobs by Source</CardTitle>
                <CardDescription>Distribution across platforms</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <SimpleBarChart 
                  data={sourcesChartData} 
                  options={{
                    responsive: true,
                    plugins: { legend: { display: false } },
                  }}
                  className="aspect-[4/3]"
                />
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Configuration Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Active Sources</h4>
                    <div className="flex flex-wrap gap-2">
                      {settings.sources.map((source, i) => (
                        <Badge key={i} variant="secondary">{source}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Target Countries</h4>
                    <div className="flex flex-wrap gap-2">
                      {settings.countries.map((country, i) => (
                        <Badge key={i} variant="outline">{country}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Advanced Features</h4>
                    <div className="flex flex-col space-y-1 text-sm">
                      <div className="flex items-center">
                        <div className={`h-2 w-2 mr-2 rounded-full ${settings.useAI ? "bg-green-500" : "bg-gray-300"}`}></div>
                        AI Enhancement
                      </div>
                      <div className="flex items-center">
                        <div className={`h-2 w-2 mr-2 rounded-full ${settings.depthCrawling ? "bg-green-500" : "bg-gray-300"}`}></div>
                        Depth Crawling
                      </div>
                      <div className="flex items-center">
                        <div className={`h-2 w-2 mr-2 rounded-full ${settings.extractCompanyData ? "bg-green-500" : "bg-gray-300"}`}></div>
                        Company Data
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="sources">
          <ScraperSources settings={settings} setSettings={setSettings} />
        </TabsContent>
        
        <TabsContent value="pipelines">
          <ScraperPipelines />
        </TabsContent>
        
        <TabsContent value="results">
          <ScraperResults results={results} />
        </TabsContent>
        
        <TabsContent value="schedule">
          <ScraperSchedule />
        </TabsContent>
        
        <TabsContent value="logs">
          <ScraperLogs logs={logs} />
        </TabsContent>
      </Tabs>
      
      <Card>
        <CardHeader>
          <CardTitle>Configure Scraper</CardTitle>
          <CardDescription>Set parameters for your next scraping operation</CardDescription>
        </CardHeader>
        <CardContent>
          <JobScraperFilters 
            settings={settings}
            setSettings={setSettings}
            onScrape={onScrape}
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ScraperDashboard;
