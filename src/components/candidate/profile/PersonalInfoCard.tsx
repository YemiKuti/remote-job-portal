
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { User } from '@supabase/supabase-js';

interface PersonalInfoCardProps {
  user: User | null;
  profileData: {
    avatar_url?: string;
  } | null;
  formData: {
    fullName: string;
    phone: string;
    location: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleChoosePhoto: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

export function PersonalInfoCard({ 
  user,
  profileData,
  formData, 
  handleInputChange,
  handleChoosePhoto,
  fileInputRef
}: PersonalInfoCardProps) {
  // Use avatar from profiles table first, then fallback to user metadata
  const avatarUrl = profileData?.avatar_url || user?.user_metadata?.avatar_url || "";
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>Update your personal details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback>{user?.user_metadata?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || "U"}</AvatarFallback>
          </Avatar>
          <div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleChoosePhoto}
            >
              Change Photo
            </Button>
          </div>
        </div>
        
        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="fullName">Full Name</Label>
            <Input 
              id="fullName" 
              value={formData.fullName}
              onChange={handleInputChange}
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
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Your phone number"
            />
          </div>
          
          <div className="grid gap-1.5">
            <Label htmlFor="location">Location</Label>
            <Input 
              id="location" 
              value={formData.location}
              onChange={handleInputChange}
              placeholder="City, Country" 
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
