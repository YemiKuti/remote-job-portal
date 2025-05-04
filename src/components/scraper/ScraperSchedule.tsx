
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const scheduledJobs = [
  {
    id: "schedule-1",
    name: "Daily LinkedIn Scrape",
    frequency: "Daily",
    nextRun: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
    sources: ["LinkedIn"],
    enabled: true,
  },
  {
    id: "schedule-2",
    name: "Weekly Full Scrape",
    frequency: "Weekly",
    nextRun: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    sources: ["LinkedIn", "Indeed", "Glassdoor", "Stack Overflow"],
    enabled: true,
  },
  {
    id: "schedule-3",
    name: "Monthly Archive",
    frequency: "Monthly",
    nextRun: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    sources: ["All"],
    enabled: false,
  },
];

const ScraperSchedule = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Tasks</CardTitle>
          <CardDescription>Automate job scraping on a recurring schedule</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end mb-4">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Schedule
            </Button>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Next Run</TableHead>
                <TableHead>Sources</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scheduledJobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-medium">{job.name}</TableCell>
                  <TableCell>{job.frequency}</TableCell>
                  <TableCell>{new Date(job.nextRun).toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {job.sources.map((source, i) => (
                        <Badge key={i} variant="outline">{source}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Switch checked={job.enabled} />
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm">Edit</Button>
                    <Button variant="outline" size="sm">Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Create New Schedule</CardTitle>
          <CardDescription>Set up recurring scraping tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="schedule-name">Schedule Name</Label>
                <Input id="schedule-name" placeholder="Daily LinkedIn Scrape" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Select defaultValue="daily">
                  <SelectTrigger id="frequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="time">Start Time</Label>
                <Input id="time" type="time" defaultValue="09:00" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Sources to Scrape</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {["LinkedIn", "Indeed", "Glassdoor", "Stack Overflow", "RemoteOK"].map((source) => (
                  <div className="flex items-center space-x-2" key={source}>
                    <Switch id={`source-${source}`} />
                    <Label htmlFor={`source-${source}`}>{source}</Label>
                  </div>
                ))}
              </div>
            </div>
            
            <Button type="submit" className="mt-4">Create Schedule</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScraperSchedule;
