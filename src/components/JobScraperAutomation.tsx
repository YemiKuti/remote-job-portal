
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { toast } from "sonner";
import { ScraperSettings } from "@/types/scraper";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, Check, Copy, Shield } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface JobScraperAutomationProps {
  settings: ScraperSettings;
  setSettings: (settings: ScraperSettings) => void;
}

export const JobScraperAutomation = ({ 
  settings, 
  setSettings 
}: JobScraperAutomationProps) => {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [enableEmail, setEnableEmail] = useState(false);
  const [emailAddress, setEmailAddress] = useState("");
  const [enableSchedule, setEnableSchedule] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  const [copied, setCopied] = useState(false);
  const [proxyEnabled, setProxyEnabled] = useState(false);
  const [proxyUrl, setProxyUrl] = useState("");
  const [proxyRotation, setProxyRotation] = useState(false);

  const updateSettings = (newValues: Partial<ScraperSettings>) => {
    setSettings({ ...settings, ...newValues });
  };

  const handleAutomateSetup = () => {
    if (enableSchedule && !scheduledDate) {
      toast.error("Please select a scheduled date for automation");
      return;
    }

    if (enableEmail && !emailAddress) {
      toast.error("Please enter an email address for results delivery");
      return;
    }

    const message = enableSchedule
      ? `Automation scheduled for ${format(scheduledDate!, "PPP")}. Results will be delivered ${
          enableEmail ? `to ${emailAddress}` : "via webhook"
        }.`
      : `Automation setup with ${settings.schedule} schedule. Results will be delivered ${
          enableEmail ? `to ${emailAddress}` : "via webhook"
        }.`;

    toast.success(message);
  };

  const handleGenerateApiKey = () => {
    // Generate a mock API key for demo purposes
    const newApiKey = `atj_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    setApiKey(newApiKey);
    toast.success("API key generated successfully");
  };

  const handleCopyApiKey = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("API key copied to clipboard");
    }
  };

  const handleProxyChange = (enabled: boolean) => {
    setProxyEnabled(enabled);
    updateSettings({ useProxy: enabled });
    
    if (enabled && !proxyUrl) {
      toast.info("Enter proxy URL to enable IP rotation and avoid rate limiting");
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="schedule">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="proxy">Proxy Settings</TabsTrigger>
          <TabsTrigger value="api">API Access</TabsTrigger>
        </TabsList>
        
        <TabsContent value="schedule" className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Automation Settings</h3>
            
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
                <p className="text-sm text-gray-500">Your server endpoint that will receive the job data</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="schedule">Schedule Frequency</Label>
                <Select 
                  value={settings.schedule} 
                  onValueChange={(value) => updateSettings({ schedule: value })}
                >
                  <SelectTrigger id="schedule">
                    <SelectValue placeholder="Select schedule" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableSchedule"
                  checked={enableSchedule}
                  onCheckedChange={setEnableSchedule}
                />
                <Label htmlFor="enableSchedule">Schedule for specific date/time</Label>
              </div>
              
              {enableSchedule && (
                <div className="space-y-2 pl-6">
                  <Label>Scheduled Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !scheduledDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {scheduledDate ? format(scheduledDate, "PPP") : <span>Select date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={scheduledDate}
                        onSelect={setScheduledDate}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
              
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableEmail"
                    checked={enableEmail}
                    onCheckedChange={setEnableEmail}
                  />
                  <Label htmlFor="enableEmail">Email results</Label>
                </div>
                
                {enableEmail && (
                  <div className="space-y-2 pl-6">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      placeholder="your@email.com"
                    />
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="autoExport" 
                  checked={settings.autoExport}
                  onCheckedChange={(checked) => updateSettings({ autoExport: !!checked })}
                />
                <Label htmlFor="autoExport">Auto-export to {settings.exportFormat.toUpperCase()} after scraping</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="cleanData" 
                  checked={settings.cleanData}
                  onCheckedChange={(checked) => updateSettings({ cleanData: !!checked })}
                />
                <Label htmlFor="cleanData">Clean data before export (remove duplicates, format inconsistencies)</Label>
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
        </TabsContent>
        
        <TabsContent value="proxy" className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Proxy & Anti-Detection Settings</h3>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="proxyEnabled"
                  checked={proxyEnabled}
                  onCheckedChange={handleProxyChange}
                />
                <Label htmlFor="proxyEnabled">Use proxy for scraping</Label>
              </div>
              
              {proxyEnabled && (
                <div className="space-y-4 pl-6">
                  <div className="space-y-2">
                    <Label htmlFor="proxyUrl">Proxy URL</Label>
                    <Input
                      id="proxyUrl"
                      type="text"
                      value={proxyUrl}
                      onChange={(e) => setProxyUrl(e.target.value)}
                      placeholder="http://user:pass@proxy.example.com:8080"
                    />
                    <p className="text-sm text-gray-500">Your proxy server URL with authentication if required</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="proxyRotation"
                      checked={proxyRotation}
                      onCheckedChange={(checked) => {
                        setProxyRotation(checked);
                        updateSettings({ rotateUserAgent: checked });
                      }}
                    />
                    <Label htmlFor="proxyRotation">Enable user-agent rotation</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="captchaDetection" 
                      checked={settings.captchaDetection}
                      onCheckedChange={(checked) => updateSettings({ captchaDetection: !!checked })}
                    />
                    <Label htmlFor="captchaDetection">Enable CAPTCHA detection and notifications</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="delayBetweenRequests" 
                      checked={settings.delayBetweenRequests}
                      onCheckedChange={(checked) => updateSettings({ delayBetweenRequests: !!checked })}
                    />
                    <Label htmlFor="delayBetweenRequests">Add random delay between requests</Label>
                  </div>
                  
                  <div className="p-4 border rounded-md bg-yellow-50 flex items-start space-x-2">
                    <Shield className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-yellow-800">Using proxies helps avoid IP blocking and rate limiting when scraping job sites.</p>
                      <p className="text-sm text-yellow-800 mt-1">We recommend rotating proxies for large scraping operations.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="api" className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">API Access</h3>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Generate an API key to programmatically access our job scraping functionality
              </p>
              
              <div className="flex space-x-2">
                <Input
                  readOnly
                  value={apiKey}
                  type="text"
                  placeholder="No API key generated yet"
                  className="font-mono text-sm"
                />
                <Button 
                  onClick={handleCopyApiKey} 
                  variant="outline" 
                  className="w-10 p-0"
                  disabled={!apiKey}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              
              <Button 
                onClick={handleGenerateApiKey}
                className="w-full bg-job-green hover:bg-job-darkGreen"
              >
                {apiKey ? "Regenerate API Key" : "Generate API Key"}
              </Button>
              
              {apiKey && (
                <div className="text-sm text-gray-500 mt-2">
                  <p>Use this key with our API to trigger job scraping programmatically.</p>
                  <p className="font-semibold mt-1">Important: Keep this key secret!</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
