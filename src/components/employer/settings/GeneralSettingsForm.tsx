
import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardDescription, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';

interface GeneralSettingsFormProps {
  formData: {
    fullName: string;
    email: string;
    phone: string;
    jobTitle: string;
  };
  passwordData: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSaveChanges: () => Promise<void>;
  isSubmitting: boolean;
}

export function GeneralSettingsForm({
  formData,
  passwordData,
  handleInputChange,
  handlePasswordChange,
  handleSaveChanges,
  isSubmitting
}: GeneralSettingsFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Settings</CardTitle>
        <CardDescription>Update your account information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="fullName">Full Name</Label>
            <Input 
              id="fullName" 
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Your name" 
            />
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="email">Email Address</Label>
            <Input 
              id="email" 
              type="email" 
              value={formData.email}
              disabled 
              placeholder="Your email" 
            />
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="phone">Phone Number</Label>
            <Input 
              id="phone" 
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Your phone number" 
            />
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="jobTitle">Job Title</Label>
            <Input 
              id="jobTitle" 
              value={formData.jobTitle}
              onChange={handleInputChange}
              placeholder="Your position" 
            />
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-1">
          <Label htmlFor="currentPassword">Current Password</Label>
          <Input 
            id="currentPassword" 
            type="password" 
            value={passwordData.currentPassword}
            onChange={handlePasswordChange}
            placeholder="Enter current password" 
          />
        </div>
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="newPassword">New Password</Label>
            <Input 
              id="newPassword" 
              type="password" 
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              placeholder="Enter new password" 
            />
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input 
              id="confirmPassword" 
              type="password" 
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              placeholder="Confirm new password" 
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSaveChanges}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : "Save Changes"}
        </Button>
      </CardFooter>
    </Card>
  );
}
