
import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const EmployerCompany = () => {
  return (
    <DashboardLayout userType="employer">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Company Profile</h2>
          <p className="text-muted-foreground">
            Update your company information and branding
          </p>
        </div>
        <Separator />
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Basic details about your company</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="h-20 w-20 rounded-md bg-gray-200 flex items-center justify-center text-gray-500">Logo</div>
                  <div>
                    <Button variant="outline" size="sm">Upload Logo</Button>
                    <p className="text-sm text-muted-foreground mt-1">Recommended: 400x400px</p>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input id="companyName" placeholder="Your company name" />
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" type="url" placeholder="https://" />
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="industry">Industry</Label>
                  <Input id="industry" placeholder="e.g. Technology, Healthcare" />
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" placeholder="City, Country" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Company Description</CardTitle>
              <CardDescription>Tell candidates about your company</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="summary">Short Summary</Label>
                <Input id="summary" placeholder="Brief description of your company (1-2 sentences)" />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="description">Full Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Describe your company, mission, and culture"
                  className="min-h-[200px]"
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="benefits">Benefits & Perks</Label>
                <Textarea 
                  id="benefits" 
                  placeholder="List the benefits you offer to employees"
                />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Social Media & Contact</CardTitle>
            <CardDescription>Add your company's social media links and contact information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input id="linkedin" placeholder="LinkedIn URL" />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="twitter">Twitter</Label>
                <Input id="twitter" placeholder="Twitter URL" />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="facebook">Facebook</Label>
                <Input id="facebook" placeholder="Facebook URL" />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="instagram">Instagram</Label>
                <Input id="instagram" placeholder="Instagram URL" />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="email">Contact Email</Label>
                <Input id="email" type="email" placeholder="contact@yourcompany.com" />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="phone">Contact Phone</Label>
                <Input id="phone" placeholder="+1 (123) 456-7890" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t pt-4">
            <Button>Save Changes</Button>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default EmployerCompany;
