
import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/components/AuthProvider';

const CandidateProfile = () => {
  const { user } = useAuth();
  
  return (
    <DashboardLayout userType="candidate">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Profile</h2>
          <p className="text-muted-foreground">
            Manage your profile information and preferences
          </p>
        </div>
        <Separator />
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user?.user_metadata?.avatar_url || ""} />
                  <AvatarFallback>{user?.user_metadata?.full_name?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm">Change Photo</Button>
                </div>
              </div>
              
              <div className="grid gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input 
                    id="fullName" 
                    defaultValue={user?.user_metadata?.full_name || ""}
                    placeholder="Full Name" 
                  />
                </div>
                
                <div className="grid gap-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={user?.email || ""}
                    disabled
                  />
                </div>
                
                <div className="grid gap-1.5">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    type="tel"
                    placeholder="Your phone number"
                  />
                </div>
                
                <div className="grid gap-1.5">
                  <Label htmlFor="location">Location</Label>
                  <Input 
                    id="location" 
                    placeholder="City, Country" 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Professional Information</CardTitle>
              <CardDescription>Update your professional details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-1.5">
                <Label htmlFor="title">Professional Title</Label>
                <Input 
                  id="title" 
                  placeholder="e.g. Frontend Developer" 
                />
              </div>
              
              <div className="grid gap-1.5">
                <Label htmlFor="experience">Years of Experience</Label>
                <Input 
                  id="experience" 
                  type="number"
                  min="0"
                  placeholder="Years of experience" 
                />
              </div>
              
              <div className="grid gap-1.5">
                <Label htmlFor="skills">Skills</Label>
                <Input 
                  id="skills" 
                  placeholder="e.g. React, Node.js, TypeScript" 
                />
                <p className="text-xs text-muted-foreground">Separate skills with commas</p>
              </div>
              
              <div className="grid gap-1.5">
                <Label htmlFor="bio">Professional Summary</Label>
                <Textarea 
                  id="bio" 
                  placeholder="Write a brief summary about yourself"
                  className="min-h-[120px]"
                />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex justify-end">
          <Button>Save Changes</Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CandidateProfile;
