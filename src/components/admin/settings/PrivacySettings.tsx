
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
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

export function PrivacySettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Privacy Settings</CardTitle>
        <CardDescription>Configure privacy and data retention settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Data Retention</p>
              <p className="text-sm text-muted-foreground">
                Automatically delete inactive user data after 1 year
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Cookie Consent Banner</p>
              <p className="text-sm text-muted-foreground">
                Show cookie consent banner to new visitors
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Analytics</p>
              <p className="text-sm text-muted-foreground">
                Enable website analytics collection
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button>Save Privacy Settings</Button>
      </CardFooter>
    </Card>
  );
}
