
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

export function ApplicationSettings() {
  const handleSaveAppSettings = () => {
    toast.success("App settings saved successfully");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Application Settings</CardTitle>
        <CardDescription>Configure global application settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Maintenance Mode</p>
              <p className="text-sm text-muted-foreground">
                Put the application in maintenance mode
              </p>
            </div>
            <Switch />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Allow Job Posting</p>
              <p className="text-sm text-muted-foreground">
                Allow employers to post new jobs
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Auto-Approve Jobs</p>
              <p className="text-sm text-muted-foreground">
                Automatically approve new job postings
              </p>
            </div>
            <Switch />
          </div>
          
          <Separator />
          
          <div className="space-y-1">
            <Label htmlFor="jobsPerPage">Jobs Per Page</Label>
            <Input 
              id="jobsPerPage" 
              type="number" 
              defaultValue="20" 
              min="5" 
              max="100" 
            />
            <p className="text-xs text-muted-foreground">
              Number of jobs to display per page
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSaveAppSettings}>Save Settings</Button>
      </CardFooter>
    </Card>
  );
}
