
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Camera, User } from 'lucide-react';
import { UserAvatar } from '@/components/ui/user-avatar';

interface PersonalInfoCardProps {
  user: any;
  profileData: any;
  formData: {
    fullName: string;
    phone: string;
    location: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleChoosePhoto: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

export const PersonalInfoCard = ({
  user,
  profileData,
  formData,
  handleInputChange,
  handleChoosePhoto,
  fileInputRef
}: PersonalInfoCardProps) => {
  const getUserInitials = () => {
    const name = formData.fullName || user?.user_metadata?.full_name || user?.email || '';
    return name
      .split(' ')
      .map((word: string) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Personal Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Profile Photo Section */}
        <div className="flex flex-col items-center space-y-3">
          <div className="relative">
            <UserAvatar 
              userId={user?.id}
              fallbackText={getUserInitials()}
              className="h-24 w-24"
            />
            <Button
              type="button"
              size="icon"
              variant="secondary"
              className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
              onClick={handleChoosePhoto}
            >
              <Camera className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Click the camera icon to update your profile photo
          </p>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Enter your full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={user?.email || ''}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Email cannot be changed here. Contact support if needed.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Enter your phone number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Enter your location"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
