
import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const EmployerSettings = () => {
  return (
    <DashboardLayout userType="employer">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
        <Separator />
        
        <Tabs defaultValue="general">
          <TabsList className="mb-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="team">Team Members</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Update your account information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" placeholder="Your name" />
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" placeholder="Your email" />
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" placeholder="Your phone number" />
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input id="jobTitle" placeholder="Your position" />
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-1">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" placeholder="Enter current password" />
                </div>
                
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" type="password" placeholder="Enter new password" />
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input id="confirmPassword" type="password" placeholder="Confirm new password" />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button>Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Control which notifications you receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">New Applications</p>
                      <p className="text-sm text-muted-foreground">Get notified when a candidate applies to your job posting</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Messages</p>
                      <p className="text-sm text-muted-foreground">Receive notifications for new messages from candidates</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Job Post Updates</p>
                      <p className="text-sm text-muted-foreground">Get notified about job posting performance and updates</p>
                    </div>
                    <Switch />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Marketing Communications</p>
                      <p className="text-sm text-muted-foreground">Receive newsletters and promotional material</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button>Save Preferences</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="billing">
            <Card>
              <CardHeader>
                <CardTitle>Billing Information</CardTitle>
                <CardDescription>Manage your subscription and payment methods</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-md border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Current Plan: Business</p>
                      <p className="text-sm text-muted-foreground">$99/month, billed monthly</p>
                    </div>
                    <Button variant="outline">Upgrade Plan</Button>
                  </div>
                </div>
                
                <div className="rounded-md border p-4">
                  <p className="font-medium mb-2">Payment Methods</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-12 bg-gray-200 rounded"></div>
                      <div>
                        <p className="text-sm">Visa ending in 4242</p>
                        <p className="text-xs text-muted-foreground">Expires 12/26</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                </div>
                
                <div className="rounded-md border p-4">
                  <p className="font-medium mb-2">Billing History</p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <p className="text-sm">May 1, 2025</p>
                      <p className="text-sm font-medium">$99.00</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-sm">Apr 1, 2025</p>
                      <p className="text-sm font-medium">$99.00</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-sm">Mar 1, 2025</p>
                      <p className="text-sm font-medium">$99.00</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline">Download Invoices</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="team">
            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>Manage your team and their access levels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button>Add Team Member</Button>
                
                <div className="relative overflow-x-auto rounded-md border">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-xs uppercase">
                      <tr>
                        <th scope="col" className="px-6 py-3">Name</th>
                        <th scope="col" className="px-6 py-3">Email</th>
                        <th scope="col" className="px-6 py-3">Role</th>
                        <th scope="col" className="px-6 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-white border-b">
                        <td className="px-6 py-4 font-medium">Jane Doe</td>
                        <td className="px-6 py-4">jane@example.com</td>
                        <td className="px-6 py-4">Admin</td>
                        <td className="px-6 py-4">
                          <Button variant="outline" size="sm">Edit</Button>
                        </td>
                      </tr>
                      <tr className="bg-white border-b">
                        <td className="px-6 py-4 font-medium">John Smith</td>
                        <td className="px-6 py-4">john@example.com</td>
                        <td className="px-6 py-4">Recruiter</td>
                        <td className="px-6 py-4">
                          <Button variant="outline" size="sm">Edit</Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default EmployerSettings;
