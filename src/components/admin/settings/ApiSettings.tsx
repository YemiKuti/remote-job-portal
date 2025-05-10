
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

export function ApiSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>API Configuration</CardTitle>
        <CardDescription>Manage API keys and settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-1">
          <Label htmlFor="apiKey">API Key</Label>
          <div className="flex gap-2">
            <Input id="apiKey" type="password" value="sk_test_abc123xyz456" readOnly />
            <Button variant="outline">Reveal</Button>
            <Button variant="outline">Copy</Button>
          </div>
          <p className="text-xs text-muted-foreground">Your secret API key</p>
        </div>
        
        <Separator />
        
        <div className="space-y-1">
          <Label htmlFor="webhookUrl">Webhook URL</Label>
          <Input id="webhookUrl" placeholder="https://your-domain.com/webhooks/jobs" />
          <p className="text-xs text-muted-foreground">URL where webhook events will be sent</p>
        </div>
        
        <Separator />
        
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Rate Limiting</p>
            <p className="text-sm text-muted-foreground">Enable API rate limiting</p>
          </div>
          <Switch defaultChecked />
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="destructive" className="mr-2">
          Reset API Key
        </Button>
        <Button>
          Save API Settings
        </Button>
      </CardFooter>
    </Card>
  );
}
