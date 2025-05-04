
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, CheckCircle, Info } from "lucide-react";

interface Log {
  id: string;
  timestamp: string;
  level: "info" | "warning" | "error" | "debug";
  source: string;
  message: string;
}

// Sample logs if none provided
const sampleLogs: Log[] = [
  {
    id: "1",
    timestamp: new Date().toISOString(),
    level: "info",
    source: "linkedin_spider",
    message: "Spider started, targeting software engineer jobs"
  },
  {
    id: "2",
    timestamp: new Date(Date.now() - 5000).toISOString(),
    level: "info",
    source: "indeed_spider",
    message: "Successfully scraped 45 job listings"
  },
  {
    id: "3",
    timestamp: new Date(Date.now() - 15000).toISOString(),
    level: "warning",
    source: "glassdoor_spider",
    message: "Rate limit approaching (80%), implementing delay"
  },
  {
    id: "4",
    timestamp: new Date(Date.now() - 25000).toISOString(),
    level: "error",
    source: "remoteok_spider",
    message: "Failed to parse job details: Invalid HTML structure"
  },
  {
    id: "5",
    timestamp: new Date(Date.now() - 60000).toISOString(),
    level: "debug",
    source: "job_normalizer",
    message: "Processing batch of 100 jobs for normalization"
  }
];

interface ScraperLogsProps {
  logs?: Log[];
}

const ScraperLogs = ({ logs = sampleLogs }: ScraperLogsProps) => {
  const [logLevel, setLogLevel] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  const filteredLogs = logs.filter(log => {
    // Filter by log level
    if (logLevel !== "all" && log.level !== logLevel) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery && !log.message.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !log.source.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Scraper Logs</CardTitle>
          <CardDescription>Real-time logs from the scraping process</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="w-full md:w-1/4">
              <Select value={logLevel} onValueChange={setLogLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="debug">Debug</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 flex gap-2">
              <Input 
                placeholder="Search logs..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button variant="outline" onClick={() => setSearchQuery("")}>Clear</Button>
            </div>
          </div>
          
          <ScrollArea className="h-[400px] rounded border p-4">
            <div className="space-y-2">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <div key={log.id} className="p-3 border rounded-md">
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center">
                        {log.level === "info" && <Info className="h-4 w-4 text-blue-500 mr-2" />}
                        {log.level === "warning" && <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />}
                        {log.level === "error" && <AlertCircle className="h-4 w-4 text-red-500 mr-2" />}
                        {log.level === "debug" && <CheckCircle className="h-4 w-4 text-gray-500 mr-2" />}
                        <span className="text-sm font-medium">{log.source}</span>
                      </div>
                      <Badge variant={
                        log.level === "info" ? "default" :
                        log.level === "warning" ? "secondary" :
                        log.level === "error" ? "destructive" : "outline"
                      }>
                        {log.level}
                      </Badge>
                    </div>
                    <p className="text-sm">{log.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(log.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No logs matching your filters
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScraperLogs;
