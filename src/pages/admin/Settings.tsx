
import React from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

const SettingsAdmin = () => {
  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">System Settings</h1>
          <p className="text-muted-foreground">Configure system-wide settings</p>
        </div>

        <Tabs defaultValue="general">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="api">API & Integrations</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Basic Settings</CardTitle>
                <CardDescription>Configure basic portal settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="site-name">Site Name</Label>
                  <Input id="site-name" defaultValue="AfricanTechJobs" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="site-description">Site Description</Label>
                  <Input id="site-description" defaultValue="Find tech jobs across Africa" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-email">Contact Email</Label>
                  <Input id="contact-email" type="email" defaultValue="contact@africantechjobs.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="support-email">Support Email</Label>
                  <Input id="support-email" type="email" defaultValue="support@africantechjobs.com" />
                </div>
              </CardContent>
              <CardFooter>
                <Button>Save Changes</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Localization</CardTitle>
                <CardDescription>Configure regional settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Default Timezone</Label>
                  <select 
                    id="timezone" 
                    className="w-full p-2 border rounded-md"
                    defaultValue="Africa/Nairobi"
                  >
                    <option value="Africa/Nairobi">Africa/Nairobi (UTC+03:00)</option>
                    <option value="Africa/Lagos">Africa/Lagos (UTC+01:00)</option>
                    <option value="Africa/Cairo">Africa/Cairo (UTC+02:00)</option>
                    <option value="Africa/Johannesburg">Africa/Johannesburg (UTC+02:00)</option>
                    <option value="Africa/Accra">Africa/Accra (UTC+00:00)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date-format">Date Format</Label>
                  <select 
                    id="date-format" 
                    className="w-full p-2 border rounded-md"
                    defaultValue="DD/MM/YYYY"
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
              </CardContent>
              <CardFooter>
                <Button>Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Appearance Settings</CardTitle>
                <CardDescription>Customize the look and feel of your portal</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="border rounded-md p-4 flex flex-col items-center cursor-pointer bg-white shadow-sm">
                      <div className="h-20 w-full mb-2 bg-green-600 rounded-md"></div>
                      <span>Default</span>
                    </div>
                    <div className="border rounded-md p-4 flex flex-col items-center cursor-pointer">
                      <div className="h-20 w-full mb-2 bg-blue-600 rounded-md"></div>
                      <span>Blue</span>
                    </div>
                    <div className="border rounded-md p-4 flex flex-col items-center cursor-pointer">
                      <div className="h-20 w-full mb-2 bg-purple-600 rounded-md"></div>
                      <span>Purple</span>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label htmlFor="logo">Logo</Label>
                  <Input id="logo" type="file" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="favicon">Favicon</Label>
                  <Input id="favicon" type="file" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="dark-mode">Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">Enable dark mode for the admin interface</p>
                  </div>
                  <Switch id="dark-mode" />
                </div>
              </CardContent>
              <CardFooter>
                <Button>Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Configure email and system notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <h3 className="font-medium">Email Notifications</h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>New User Registration</Label>
                      <p className="text-sm text-muted-foreground">Send notification when a new user registers</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>New Job Posted</Label>
                      <p className="text-sm text-muted-foreground">Send notification when a new job is posted</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>New Company Registration</Label>
                      <p className="text-sm text-muted-foreground">Send notification when a new company registers</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Payment Received</Label>
                      <p className="text-sm text-muted-foreground">Send notification when a payment is received</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="font-medium">System Notifications</h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>System Alerts</Label>
                      <p className="text-sm text-muted-foreground">Show system alerts in the admin dashboard</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Usage Reports</Label>
                      <p className="text-sm text-muted-foreground">Send weekly usage reports</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button>Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="api" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>API & Integrations</CardTitle>
                <CardDescription>Manage API keys and third-party integrations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">API Access</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="api-key">API Key</Label>
                    <div className="flex gap-2">
                      <Input id="api-key" value="sk_live_************XXXX" readOnly className="flex-1" />
                      <Button variant="outline">Regenerate</Button>
                      <Button variant="outline">Copy</Button>
                    </div>
                    <p className="text-sm text-muted-foreground">Use this key to authenticate API requests</p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable API Access</Label>
                      <p className="text-sm text-muted-foreground">Allow external applications to access the API</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="font-medium">Integrations</h3>
                  
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-md bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-bold">S</span>
                        </div>
                        <div>
                          <h4 className="font-medium">Stripe</h4>
                          <p className="text-sm text-muted-foreground">Payment processing</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Connected</span>
                        <Button variant="outline" size="sm">Configure</Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-md bg-red-100 flex items-center justify-center">
                          <span className="text-red-600 font-bold">G</span>
                        </div>
                        <div>
                          <h4 className="font-medium">Google Analytics</h4>
                          <p className="text-sm text-muted-foreground">Website analytics</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">Connect</Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-md bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-bold">M</span>
                        </div>
                        <div>
                          <h4 className="font-medium">Mailchimp</h4>
                          <p className="text-sm text-muted-foreground">Email marketing</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">Connect</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button>Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="advanced" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
                <CardDescription>Configure advanced system settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">System Maintenance</h3>
                  
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full">Clear Cache</Button>
                    <p className="text-xs text-muted-foreground">Clear system cache to refresh data</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full">Rebuild Search Index</Button>
                    <p className="text-xs text-muted-foreground">Rebuild the search index for better performance</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full">Export Database</Button>
                    <p className="text-xs text-muted-foreground">Export the database for backup purposes</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="font-medium">Danger Zone</h3>
                  
                  <div className="space-y-2">
                    <Button variant="destructive" className="w-full">Purge All Job Listings</Button>
                    <p className="text-xs text-muted-foreground">Delete all job listings from the system (cannot be undone)</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Button variant="destructive" className="w-full">Reset System</Button>
                    <p className="text-xs text-muted-foreground">Reset the system to factory defaults (cannot be undone)</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-xs text-muted-foreground">Exercise extreme caution with these actions as they can result in data loss.</p>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default SettingsAdmin;
